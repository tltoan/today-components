import SwiftUI

/// All seven selected faces in one standalone file. iOS 17+ / macOS 14+.
/// Loop, Tilt, Mellow, Dash, Drift, Skeptic, and Lift. No assets or packages needed.
///
///     PlayfulFace(style: .loop) { /* Your tap action */ }
///         .frame(width: 280, height: 280)
///
/// Every feature is a deforming vector path. The circle stays still. The eyes
/// lead each turn, the nose follows, and the pose settles before the next beat.
enum PlayfulFaceStyle: String, CaseIterable {
    case loop = "Loop", tilt = "Tilt"
    case mellow = "Mellow", dash = "Dash", drift = "Drift"
    case skeptic = "Skeptic", lift = "Lift"
}

struct PlayfulFace: View {
    var style: PlayfulFaceStyle = .mellow
    var ink: Color = .black
    var surface: Color = .white
    var shadowOpacity: Double = 0.075
    var onTap: () -> Void = {}

    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @Environment(\.scenePhase) private var scenePhase
    @State private var started: TimeInterval?
    @State private var elapsed: TimeInterval = 0
    @State private var visible = false
    @State private var reactionStarted: TimeInterval?
    @State private var taps = 0

    var body: some View {
        Button {
            let now = animationTime
            // Repeated taps still call the action, but never snap a running pose.
            if reactionStarted == nil || now - reactionStarted! >= FacePerformance.duration {
                reactionStarted = now
            }
            taps += 1
            onTap()
        } label: {
            TimelineView(.animation(minimumInterval: 1 / 60, paused: started == nil)) { _ in
                let t = animationTime
                PlayfulFaceArtwork(style: style, time: reduceMotion ? 0 : t,
                    reactionAge: reduceMotion ? nil : reactionStarted.map { t - $0 },
                    ink: ink, surface: surface, shadowOpacity: shadowOpacity)
            }
            .aspectRatio(1, contentMode: .fit)
            .contentShape(Circle().inset(by: 12))
        }
        .buttonStyle(PlayfulFacePressStyle())
        .accessibilityLabel("\(style.rawValue) face")
        .accessibilityHint("Tap for a playful expression")
        .sensoryFeedback(.impact(weight: .light, intensity: 0.45), trigger: taps)
        .onAppear { visible = true; updateClock() }
        .onDisappear { visible = false; updateClock() }
        .onChange(of: scenePhase) { _, _ in updateClock() }
        .onChange(of: reduceMotion) { _, _ in updateClock() }
        .onChange(of: style) { _, _ in reactionStarted = nil }
    }

    private var animationTime: TimeInterval {
        elapsed + (started.map { max(0, ProcessInfo.processInfo.systemUptime - $0) } ?? 0)
    }

    private func updateClock() {
        let now = ProcessInfo.processInfo.systemUptime
        if visible && scenePhase == .active && !reduceMotion {
            if started == nil { started = now }
        } else if let start = started {
            elapsed += max(0, now - start)
            started = nil
        }
    }
}

private struct PlayfulFacePressStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        // The animation belongs to the face, rather than scaling the whole disk.
        configuration.label.opacity(configuration.isPressed ? 0.78 : 1)
    }
}

/// A deterministic frame, also used to export the native animation preview.
struct PlayfulFaceArtwork: View {
    var style: PlayfulFaceStyle = .mellow
    var time: Double = 0
    var reactionAge: Double?
    var ink: Color = .black
    var surface: Color = .white
    var shadowOpacity: Double = 0.075

    var body: some View {
        Canvas { context, size in
            let side = min(size.width, size.height)
            guard side > 0 else { return }
            let p = FacePerformance.pose(style, time: time, reactionAge: reactionAge)
            context.translateBy(x: (size.width - side) / 2, y: (size.height - side) / 2)
            context.scaleBy(x: side / 512, y: side / 512)
            let disk = Path(ellipseIn: CGRect(x: 58, y: 58, width: 396, height: 396))
            context.drawLayer { layer in
                layer.addFilter(.shadow(color: .black.opacity(min(0.3, max(0, shadowOpacity))),
                                        radius: 18, x: 0, y: 13))
                layer.fill(disk, with: .color(surface))
            }
            context.fill(disk, with: .linearGradient(
                Gradient(colors: [.black.opacity(0), .black.opacity(0.018)]),
                startPoint: CGPoint(x: 180, y: 160), endPoint: CGPoint(x: 315, y: 450)))

            var face = context
            face.translateBy(x: 256, y: 256 + p[.lift])
            face.rotate(by: .radians(p[.tilt]))
            face.scaleBy(x: 1 - p[.stretch] * 0.35, y: 1 + p[.stretch])
            face.translateBy(x: -256, y: -256)

            // A sphere-like projection gives the nose more travel than the eyes.
            // The lower part of the face also shears, so turns deform the drawing.
            func point(_ x: Double, _ y: Double, _ depth: Double = 52) -> CGPoint {
                let yaw = p[.turn] * 0.60, pitch = p[.pitch] * 0.35
                let shear = p[.shear] * (y - 232) / 100
                return CGPoint(x: 256 + (x - 256) * cos(yaw) + depth * sin(yaw) + shear,
                               y: 256 + (y - 256) * cos(pitch) + depth * sin(pitch))
            }
            func nosePoint(_ x: Double, _ y: Double, _ depth: Double = 85) -> CGPoint {
                let u = min(1, max(0, (y - 220) / 105))
                return point(x + p[.nose] * sin(u * .pi / 2),
                             y + p[.length] * u, depth)
            }
            func stroke(_ path: Path, _ width: Double = 17) {
                face.stroke(path, with: .color(ink),
                            style: StrokeStyle(lineWidth: width, lineCap: .round, lineJoin: .round))
            }
            func brow(_ x1: Double, _ y1: Double, _ cx: Double, _ cy: Double,
                      _ x2: Double, _ y2: Double, right: Bool = false, width: Double = 13) {
                let rise = p[right ? .browR : .browL]
                let tilt = p[right ? .browTiltR : .browTiltL]
                var path = Path()
                path.move(to: point(x1, y1 - rise - tilt, 44))
                path.addQuadCurve(to: point(x2, y2 - rise + tilt, 44),
                                  control: point(cx, cy - rise - abs(rise) * 0.2, 44))
                stroke(path, width)
            }
            func eye(_ x: Double, _ y: Double, _ width: Double, _ height: Double,
                     angle: Double = 0, lid: Bool = false, right: Bool = false) {
                let opening = p[right ? .openR : .openL]
                let closing = min(1, max(0, p[right ? .closeR : .closeL]))
                let w = width * (1 - opening * 0.12 + closing * 0.1)
                let h = max(7.0, (height + opening * 30) * (1 - closing * 0.94))
                let center = point(x, y - opening * 4, 64)
                var local = face
                local.translateBy(x: center.x + p[.lookX] * 11, y: center.y + p[.lookY] * 8)
                local.rotate(by: .radians(angle + p[.eyeTilt] * (right ? -1 : 1)))
                let bend = -20 * p[.joy]
                var path = Path()
                // Both open eyes and squeezed crescents share one contour.
                // There are no hidden layers or sudden eye-shape swaps.
                if lid {
                    path.move(to: CGPoint(x: -w / 2, y: -h * 0.2))
                    path.addCurve(to: CGPoint(x: w / 2, y: -h * 0.2),
                        control1: CGPoint(x: -w / 2, y: -h * 0.2 - opening * h * 0.5 + bend),
                        control2: CGPoint(x: w / 2, y: -h * 0.2 - opening * h * 0.5 + bend))
                    path.addCurve(to: CGPoint(x: -w / 2, y: -h * 0.2),
                        control1: CGPoint(x: w / 2, y: h * 0.82 + bend),
                        control2: CGPoint(x: -w / 2, y: h * 0.82 + bend))
                } else {
                    path.move(to: CGPoint(x: -w / 2, y: 0))
                    path.addCurve(to: CGPoint(x: w / 2, y: 0),
                        control1: CGPoint(x: -w / 2, y: -h * 0.7 + bend),
                        control2: CGPoint(x: w / 2, y: -h * 0.7 + bend))
                    path.addCurve(to: CGPoint(x: -w / 2, y: 0),
                        control1: CGPoint(x: w / 2, y: h * 0.7 + bend),
                        control2: CGPoint(x: -w / 2, y: h * 0.7 + bend))
                }
                path.closeSubpath()
                local.fill(path, with: .color(ink))
            }

            var nose = Path()
            switch style {
            case .loop:
                // Keep the single brow and rounded hook. The nose curls a little
                // tighter after a turn, then releases as the smile opens.
                let rise = p[.browL], lean = p[.browTiltL], curl = p[.curl]
                var eyebrow = Path()
                eyebrow.move(to: point(176, 186 - rise - lean, 45))
                eyebrow.addCurve(to: point(215, 184 - rise + lean, 45),
                    control1: point(189, 177 - rise - abs(rise) * 0.2, 45),
                    control2: point(204, 177 - rise - abs(rise) * 0.2, 45))
                stroke(eyebrow, 14)
                eye(195, 231, 28, 39, angle: -0.05)
                eye(316, 225, 28, 39, angle: 0.05, right: true)
                nose.move(to: nosePoint(260, 209, 72))
                nose.addCurve(to: nosePoint(246, 270, 90),
                    control1: nosePoint(263, 235, 78), control2: nosePoint(246, 250, 86))
                nose.addCurve(to: nosePoint(278 - 18 * curl, 280 - 14 * curl, 90),
                    control1: nosePoint(243 - 12 * curl, 290 + 14 * curl, 92),
                    control2: nosePoint(266 + 16 * curl, 297 + 6 * curl, 92))
                stroke(nose)
                var smile = Path()
                smile.move(to: point(226 - p[.smile] * 7, 332 - p[.smile] * 8, 60))
                smile.addCurve(to: point(290 + p[.smile] * 5, 328 - p[.smile] * 7, 60),
                    control1: point(244, 350 + p[.smile] * 9, 64),
                    control2: point(273, 350 + p[.smile] * 9, 64))
                stroke(smile, 14)
            case .tilt:
                // The original uneven eyes and angled nose stay recognizable.
                // A delayed nose tip follows the inquisitive lean and wink.
                let curl = p[.curl]
                eye(191, 211, 34, 47, angle: -0.14)
                eye(319, 239, 37, 34, angle: 0.06, right: true)
                nose.move(to: nosePoint(266, 209, 72))
                nose.addCurve(to: nosePoint(239, 281, 92),
                    control1: nosePoint(257, 233, 79), control2: nosePoint(248, 257, 86))
                nose.addQuadCurve(to: nosePoint(246, 293, 92), control: nosePoint(235, 292, 94))
                nose.addCurve(to: nosePoint(277 + 8 * curl, 293 - 12 * curl, 88),
                    control1: nosePoint(256, 293 + 7 * curl, 91),
                    control2: nosePoint(267, 293 + 3 * curl, 89))
                stroke(nose, 18)
                var smile = Path()
                smile.move(to: point(273 - p[.smile] * 12, 339, 60))
                smile.addCurve(to: point(311 + p[.smile] * 4, 316 - p[.smile] * 9, 60),
                    control1: point(288, 342 + p[.smile] * 11, 62),
                    control2: point(306 + p[.smile] * 3, 333 + p[.smile] * 4, 62))
                stroke(smile, 15)
            case .mellow:
                eye(192, 219, 43, 34, angle: -0.09, lid: true)
                eye(319, 227, 39, 29, angle: 0.08, lid: true, right: true)
                nose.move(to: nosePoint(258, 232, 75))
                nose.addCurve(to: nosePoint(259, 283, 91),
                    control1: nosePoint(280, 255, 86), control2: nosePoint(282, 278, 94))
                stroke(nose)
                var smile = Path()
                smile.move(to: point(228 - p[.smile] * 7, 331 - p[.smile] * 6, 60))
                smile.addCurve(to: point(280 + p[.smile] * 7, 329 - p[.smile] * 7, 60),
                    control1: point(244, 341 + p[.smile] * 8, 63),
                    control2: point(266, 341 + p[.smile] * 8, 63))
                stroke(smile, 13)
            case .dash:
                eye(195, 223, 45, 21, angle: -0.12)
                eye(321, 212, 40, 20, angle: 0.14, right: true)
                nose.move(to: nosePoint(270, 239, 74))
                nose.addCurve(to: nosePoint(255, 285, 91),
                    control1: nosePoint(265, 254, 80), control2: nosePoint(260, 270, 87))
                stroke(nose)
                var smile = Path()
                smile.move(to: point(237 - p[.smile] * 4, 333, 60))
                smile.addCurve(to: point(294 + p[.smile] * 4, 321 - p[.smile] * 8, 60),
                    control1: point(257, 341 + p[.smile] * 11, 63),
                    control2: point(282, 334 + p[.smile] * 5, 63))
                stroke(smile, 14)
            case .drift:
                brow(166, 196, 192, 198, 217, 196, width: 12)
                brow(294, 200, 319, 202, 344, 201, right: true, width: 12)
                eye(191, 233, 45, 21, angle: 0.04, lid: true)
                eye(319, 239, 44, 20, angle: -0.03, lid: true, right: true)
                nose.move(to: nosePoint(258, 225, 72))
                nose.addCurve(to: nosePoint(249, 312, 93),
                    control1: nosePoint(257, 258, 80), control2: nosePoint(244, 289, 91))
                nose.addQuadCurve(to: nosePoint(269, 318, 91), control: nosePoint(251, 323, 94))
                stroke(nose)
            case .skeptic:
                brow(164, 207, 191, 215, 218, 211)
                brow(293, 184, 320, 167, 346, 183, right: true)
                eye(191, 243, 40, 23, angle: 0.14, lid: true)
                eye(320, 231, 35, 31, angle: -0.10, lid: true, right: true)
                nose.move(to: nosePoint(267, 224, 74))
                nose.addCurve(to: nosePoint(245, 282, 92),
                    control1: nosePoint(260, 243, 80), control2: nosePoint(252, 263, 86))
                nose.addQuadCurve(to: nosePoint(274, 283, 91), control: nosePoint(260, 291, 94))
                stroke(nose)
            case .lift:
                brow(163, 191, 190, 164, 218, 187)
                brow(294, 187, 321, 162, 347, 186, right: true)
                eye(191, 232, 33, 39)
                eye(321, 229, 34, 39, right: true)
                nose.move(to: nosePoint(255, 241, 75))
                nose.addQuadCurve(to: nosePoint(270, 285, 91), control: nosePoint(277, 271, 90))
                nose.addQuadCurve(to: nosePoint(250, 289, 91), control: nosePoint(264, 294, 94))
                stroke(nose, 16)
            }
        }
        .accessibilityHidden(true)
    }
}

// Small, independent channels keep the expression editable. Values are authored
// poses, with separate timing for the eyes, brows, head, and flexible nose.
enum FaceChannel: Int, CaseIterable {
    case turn, pitch, tilt, lift, stretch, shear, lookX, lookY
    case openL, openR, closeL, closeR, joy, eyeTilt
    case browL, browR, browTiltL, browTiltR, nose, length, smile, curl
}

struct FacePose {
    var values = Array(repeating: 0.0, count: FaceChannel.allCases.count)
    init(_ values: [FaceChannel: Double] = [:]) {
        for (channel, value) in values { self.values[channel.rawValue] = value }
    }
    subscript(_ channel: FaceChannel) -> Double {
        get { values[channel.rawValue] }
        set { values[channel.rawValue] = newValue }
    }
    func mixed(with target: FacePose, weight: Double) -> FacePose {
        var result = self
        for c in FaceChannel.allCases { result[c] += (target[c] - self[c]) * weight }
        return result
    }
}

enum FacePerformance {
    static let duration = 3.8
    static let loopDuration = 10.0
    struct Key {
        let time: Double
        let pose: FacePose
        init(_ time: Double, _ values: [FaceChannel: Double] = [:]) {
            self.time = time; pose = FacePose(values)
        }
    }

    // Anticipation → expressive turn → counter-turn → soft settle.
    static let loop: [Key] = [
        .init(0),
        .init(0.22, [.turn: 0.14, .pitch: 0.18, .closeL: 0.65, .closeR: 0.65, .stretch: -0.06, .browL: -5, .length: -6]),
        .init(0.68, [.turn: -0.72, .pitch: -0.4, .tilt: -0.14, .lookX: -1, .lookY: -0.7, .openL: 0.65, .openR: 0.4, .browL: 20, .browTiltL: -6, .nose: -24, .length: 8, .curl: 0.65, .stretch: 0.07, .lift: -6, .smile: 0.3]),
        .init(1.12, [.turn: -0.58, .pitch: -0.3, .tilt: -0.09, .lookX: -0.8, .lookY: -0.5, .openL: 0.45, .openR: 0.3, .browL: 15, .nose: -12, .curl: 0.85, .smile: 0.45]),
        .init(1.72, [.turn: 0.58, .tilt: 0.15, .lookX: 0.8, .openL: 0.2, .openR: 0.5, .browL: 9, .browTiltL: 7, .nose: 27, .length: -3, .curl: -0.25, .shear: 8, .smile: 0.65]),
        .init(2.2, [.turn: 0.16, .tilt: -0.07, .closeL: 0.95, .closeR: 0.95, .joy: 1, .browL: 10, .nose: -13, .length: -7, .curl: 0.55, .smile: 1, .lift: -4, .stretch: -0.03]),
        .init(2.7, [.turn: -0.08, .tilt: 0.03, .browL: 3, .smile: 0.35, .nose: 6, .curl: 0.15]),
        .init(3.35), .init(3.8)
    ]
    static let tilt: [Key] = [
        .init(0),
        .init(0.2, [.turn: -0.16, .tilt: -0.05, .closeL: 0.7, .closeR: 0.7, .stretch: -0.05, .length: -6]),
        .init(0.65, [.turn: 0.8, .pitch: -0.28, .tilt: 0.23, .lookX: 1.1, .lookY: -0.5, .closeL: 0.25, .openR: 0.8, .eyeTilt: 0.1, .nose: 26, .length: 9, .curl: 0.6, .shear: 9, .smile: 0.45]),
        .init(1.12, [.turn: 0.65, .pitch: -0.2, .tilt: 0.18, .lookX: 0.85, .lookY: -0.3, .closeL: 0.2, .openR: 0.6, .nose: 13, .curl: 0.4, .smile: 0.55]),
        .init(1.64, [.turn: -0.68, .pitch: 0.08, .tilt: -0.19, .lookX: -1, .openL: 0.6, .closeR: 0.5, .eyeTilt: -0.1, .nose: -28, .length: -7, .curl: -0.4, .shear: -9, .smile: 0.7]),
        .init(2.12, [.turn: -0.12, .tilt: 0.12, .openL: 0.3, .closeR: 0.98, .joy: 0.4, .nose: 16, .length: -5, .curl: 0.8, .smile: 1, .lift: -3]),
        .init(2.62, [.turn: 0.08, .tilt: -0.04, .nose: -7, .curl: -0.15, .smile: 0.4]),
        .init(3.35), .init(3.8)
    ]
    static let mellow: [Key] = [
        .init(0),
        .init(0.22, [.turn: -0.16, .pitch: 0.15, .closeL: 0.65, .closeR: 0.65, .stretch: -0.06, .length: -5]),
        .init(0.68, [.turn: 0.78, .pitch: -0.5, .tilt: -0.12, .lookX: 1, .lookY: -0.7, .openL: 1, .openR: 0.7, .nose: 22, .length: 10, .lift: -8, .stretch: 0.1, .smile: 0.4]),
        .init(1.15, [.turn: 0.64, .pitch: -0.4, .tilt: -0.08, .lookX: 0.85, .lookY: -0.5, .openL: 0.8, .openR: 0.55, .nose: 14, .length: 5, .smile: 0.5]),
        .init(1.65, [.turn: 0.2, .tilt: 0.14, .closeL: 0.96, .closeR: 0.92, .joy: 1, .smile: 1, .nose: -18, .length: -8, .stretch: -0.04, .shear: -5]),
        .init(2.15, [.turn: -0.38, .tilt: -0.09, .closeL: 0.8, .closeR: 0.8, .joy: 0.75, .smile: 1, .nose: 10, .lift: -3]),
        .init(2.7, [.turn: 0.12, .tilt: 0.035, .smile: 0.3, .nose: -5]),
        .init(3.35), .init(3.8)
    ]
    static let dash: [Key] = [
        .init(0),
        .init(0.18, [.turn: -0.2, .closeL: 0.85, .closeR: 0.85, .stretch: -0.06]),
        .init(0.52, [.turn: 0.95, .tilt: 0.12, .lookX: 1.2, .openL: 0.85, .openR: 0.55, .nose: 28, .length: 10, .shear: 10, .stretch: 0.08, .smile: 0.2]),
        .init(0.85, [.turn: 0.8, .tilt: 0.08, .lookX: 1, .openL: 0.65, .openR: 0.4, .nose: 12, .smile: 0.4]),
        .init(1.27, [.turn: -0.85, .tilt: -0.14, .lookX: -1.2, .lookY: -0.3, .openL: 0.25, .openR: 0.8, .nose: -30, .shear: -12, .smile: 0.65]),
        .init(1.65, [.turn: -0.62, .tilt: -0.08, .lookX: -0.8, .openR: 0.45, .nose: -12, .smile: 0.6]),
        .init(2.08, [.turn: 0.12, .tilt: 0.09, .closeL: 0.98, .openR: 0.45, .joy: 0.35, .smile: 1, .nose: 15, .length: -7, .eyeTilt: 0.1]),
        .init(2.48, [.turn: -0.06, .tilt: -0.03, .smile: 0.5, .nose: -7]),
        .init(3.2), .init(3.8)
    ]
    static let drift: [Key] = [
        .init(0),
        .init(0.35, [.pitch: 0.25, .lift: 7, .closeL: 0.8, .closeR: 0.65, .browL: -8, .browR: -5, .length: 14, .stretch: -0.04]),
        .init(1.0, [.turn: -0.72, .pitch: -0.7, .tilt: -0.19, .lookX: -0.8, .lookY: -1, .openL: 0.6, .openR: 0.4, .browL: 13, .browR: 5, .nose: -28, .length: 4, .lift: -4, .shear: -7]),
        .init(1.45, [.turn: -0.65, .pitch: -0.6, .tilt: -0.16, .lookX: -0.6, .lookY: -0.9, .openL: 0.4, .openR: 0.3, .browL: 9, .browR: 3, .nose: -18]),
        .init(2.15, [.turn: 0.62, .pitch: -0.15, .tilt: 0.16, .lookX: 0.9, .lookY: -0.4, .closeL: 0.3, .openR: 0.65, .browL: -3, .browR: 19, .browTiltR: -6, .nose: 24, .length: -8, .shear: 8]),
        .init(2.65, [.turn: 0.3, .tilt: 0.06, .closeL: 0.95, .closeR: 0.95, .browR: 5, .nose: -7, .length: 7]),
        .init(3.5), .init(3.8)
    ]
    static let skeptic: [Key] = [
        .init(0),
        .init(0.2, [.turn: -0.18, .closeL: 0.65, .closeR: 0.65, .browL: -4, .browR: -4, .length: -5]),
        .init(0.66, [.turn: 0.8, .pitch: 0.16, .tilt: 0.13, .lookX: 1.15, .closeL: 0.5, .openR: 0.7, .browL: -9, .browR: 27, .browTiltL: 8, .browTiltR: -9, .nose: 23, .length: -7, .eyeTilt: 0.13]),
        .init(1.2, [.turn: 0.7, .pitch: 0.12, .tilt: 0.1, .lookX: 1, .closeL: 0.4, .openR: 0.55, .browL: -7, .browR: 22, .browTiltL: 6, .browTiltR: -7, .nose: 13, .eyeTilt: 0.1]),
        .init(1.8, [.turn: -0.55, .pitch: -0.5, .tilt: -0.14, .lookX: -0.8, .lookY: -1.1, .openL: 0.7, .closeR: 0.3, .browL: 22, .browR: -9, .browTiltL: 8, .browTiltR: 7, .nose: -24, .length: 10]),
        .init(2.25, [.turn: -0.42, .tilt: -0.09, .lookX: -0.6, .openL: 0.45, .closeR: 0.25, .browL: 13, .browR: -5, .nose: -12]),
        .init(2.65, [.turn: 0.1, .closeL: 0.98, .closeR: 0.98, .nose: 8, .length: -5]),
        .init(3.35), .init(3.8)
    ]
    static let lift: [Key] = [
        .init(0),
        .init(0.2, [.pitch: 0.22, .closeL: 0.85, .closeR: 0.85, .browL: -9, .browR: -9, .lift: 9, .stretch: -0.09, .length: -7]),
        .init(0.58, [.pitch: -0.35, .tilt: -0.08, .openL: 0.8, .openR: 0.85, .browL: 21, .browR: 24, .lift: -14, .stretch: 0.12, .nose: -9, .length: 9, .lookY: -0.6]),
        .init(1.06, [.turn: -0.35, .tilt: -0.14, .closeL: 0.96, .closeR: 0.96, .joy: 1, .browL: 11, .browR: 15, .lift: -6, .nose: -21, .length: -5, .stretch: -0.03]),
        .init(1.6, [.turn: 0.45, .tilt: 0.16, .closeL: 0.9, .closeR: 0.9, .joy: 1, .browL: 18, .browR: 10, .lift: -11, .nose: 22, .stretch: 0.06]),
        .init(2.15, [.turn: 0.1, .tilt: -0.06, .closeL: 0.95, .openR: 0.3, .joy: 0.35, .browL: 1, .browR: 13, .nose: -10, .lift: 2]),
        .init(2.65, [.turn: -0.05, .tilt: 0.02, .browR: 3, .nose: 4]),
        .init(3.35), .init(3.8)
    ]

    static func keys(_ style: PlayfulFaceStyle) -> [Key] {
        switch style {
        case .loop: loop
        case .tilt: tilt
        case .mellow: mellow
        case .dash: dash
        case .drift: drift
        case .skeptic: skeptic
        case .lift: lift
        }
    }

    static func pose(_ style: PlayfulFaceStyle, time: Double, reactionAge: Double?) -> FacePose {
        let t = time.isFinite ? max(0, time) : 0
        let phase = t.truncatingRemainder(dividingBy: loopDuration)
        var result = perform(keys(style), at: phase - 0.6)
        // A separate, quieter glance gives each performance room to breathe.
        let sign = (style == .dash || style == .skeptic || style == .tilt) ? -1.0 : 1.0
        let glance: [Key] = [
            .init(0), .init(0.6, [.turn: sign * 0.48, .lookX: sign * 0.9, .tilt: sign * 0.05, .nose: sign * 10, .openL: 0.15, .browR: 5]),
            .init(1.2, [.turn: sign * 0.44, .lookX: sign * 0.8, .tilt: sign * 0.04, .nose: sign * 5, .browR: 3]),
            .init(1.7, [.turn: sign * 0.22, .pitch: 0.3, .lookX: sign * 0.3, .lookY: 0.65, .length: 6]),
            .init(2.35), .init(3.8)
        ]
        if phase >= 6 { result = perform(glance, at: phase - 6) }
        let blink = max(pulse(phase, 5.0, 0.22), pulse(phase, 8.9, 0.2))
        result[.closeL] = max(result[.closeL], blink)
        result[.closeR] = max(result[.closeR], blink)
        if let age = reactionAge, age.isFinite, age >= 0, age <= duration {
            let weight = smooth(age / 0.18) * (1 - smooth((age - 3.25) / 0.55))
            result = result.mixed(with: perform(keys(style), at: age), weight: weight)
        }
        return result
    }

    static func perform(_ keys: [Key], at time: Double) -> FacePose {
        guard time >= 0 && time <= duration else { return FacePose() }
        var result = sample(keys, at: time)
        // Small offsets, rather than one rigid transform, create follow-through.
        let eyes = sample(keys, at: time + 0.055)
        let head = sample(keys, at: time - 0.045)
        let nose = sample(keys, at: time - 0.105)
        for c in [FaceChannel.lookX, .lookY, .openL, .openR] { result[c] = eyes[c] }
        for c in [FaceChannel.turn, .pitch, .tilt, .shear] { result[c] = head[c] }
        for c in [FaceChannel.nose, .length, .curl] { result[c] = nose[c] }
        return result
    }

    static func sample(_ keys: [Key], at time: Double) -> FacePose {
        if time <= keys[0].time { return keys[0].pose }
        guard let i = (0..<keys.count - 1).first(where: { time < keys[$0 + 1].time }) else { return keys.last!.pose }
        let a = keys[i], b = keys[i + 1]
        return a.pose.mixed(with: b.pose, weight: smooth((time - a.time) / (b.time - a.time)))
    }

    static func smooth(_ value: Double) -> Double {
        let u = min(1, max(0, value))
        return u * u * u * (10 + u * (-15 + 6 * u))
    }
    static func pulse(_ time: Double, _ start: Double, _ duration: Double) -> Double {
        let u = (time - start) / duration
        return u > 0 && u < 1 ? pow(sin(.pi * u), 2) : 0
    }
}

struct PlayfulFacesPreview: View {
    @State private var style: PlayfulFaceStyle = .loop
    var body: some View {
        VStack(spacing: 16) {
            PlayfulFace(style: style).frame(width: 320, height: 320)
            Text("Tap to react").font(.subheadline).foregroundStyle(.secondary)
            Picker("Face", selection: $style) {
                ForEach(PlayfulFaceStyle.allCases, id: \.self) { Text($0.rawValue).tag($0) }
            }.pickerStyle(.menu).tint(.black.opacity(0.65))
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.white.ignoresSafeArea())
    }
}

struct PlayfulFaces_Previews: PreviewProvider {
    static var previews: some View { PlayfulFacesPreview() }
}
