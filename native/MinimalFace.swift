import SwiftUI

/// Two minimal faces with distinct features: Loop and Tilt.
/// iOS 17+ / macOS 14+. All artwork and motion are drawn in SwiftUI.
///
///     MinimalFace(style: .loop) {
///         // Your action when the face is tapped.
///     }
///     .frame(width: 280, height: 280)
///
/// Eyes lead the head through a quiet sequence of glances. Tapping produces
/// a wink and nod. Motion pauses offscreen and respects Reduce Motion.
enum MinimalFaceStyle: String, CaseIterable {
    case loop = "Loop"
    case tilt = "Tilt"
}

struct MinimalFace: View {
    var style: MinimalFaceStyle = .loop
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
    @State private var tapCount = 0

    var body: some View {
        Button {
            // Avoid restarting a wink mid-blink on rapid repeated taps.
            let now = animationTime
            if reactionStarted == nil || now - reactionStarted! > 1.2 {
                reactionStarted = now
            }
            tapCount += 1
            onTap()
        } label: {
            TimelineView(.animation(minimumInterval: 1 / 60, paused: started == nil)) { _ in
                let time = animationTime
                MinimalFaceArtwork(style: style, time: reduceMotion ? 0 : time,
                                   reactionAge: reduceMotion ? nil : reactionStarted.map { time - $0 },
                                   ink: ink, surface: surface, shadowOpacity: shadowOpacity)
            }
            .aspectRatio(1, contentMode: .fit)
            .contentShape(Circle().inset(by: 12))
        }
        .buttonStyle(MinimalFacePressStyle())
        .accessibilityLabel("\(style.rawValue) face")
        .accessibilityHint("Tap to make the face wink")
        .sensoryFeedback(.impact(weight: .light, intensity: 0.45), trigger: tapCount)
        .onAppear { visible = true; updateClock() }
        .onDisappear { visible = false; updateClock() }
        .onChange(of: scenePhase) { _, _ in updateClock() }
        .onChange(of: reduceMotion) { _, _ in updateClock() }
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

private struct MinimalFacePressStyle: ButtonStyle {
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(reduceMotion ? 1 : (configuration.isPressed ? 0.976 : 1))
            .opacity(reduceMotion && configuration.isPressed ? 0.72 : 1)
            .animation(reduceMotion ? nil : .spring(response: 0.3, dampingFraction: 0.76),
                       value: configuration.isPressed)
    }
}

/// Deterministic drawing shared with the video preview. reactionAge is the
/// number of seconds since the most recent accepted tap, or nil when idle.
struct MinimalFaceArtwork: View {
    var style: MinimalFaceStyle = .loop
    var time: Double = 0
    var reactionAge: Double?
    var ink: Color = .black
    var surface: Color = .white
    var shadowOpacity: Double = 0.075

    var body: some View {
        Canvas { context, size in
            let side = min(size.width, size.height)
            guard side > 0 else { return }
            let scale = side / 512
            let pose = MinimalFaceMotion.pose(time: time, reactionAge: reactionAge)
            context.translateBy(x: (size.width - side) / 2, y: (size.height - side) / 2)
            context.scaleBy(x: scale, y: scale)

            // The circle stays quiet; most expression comes from the features.
            context.translateBy(x: 256 + pose.head.x * 1.5, y: 256 + pose.lift)
            context.rotate(by: .radians(pose.roll))
            context.scaleBy(x: 1 + pose.squash * 0.012, y: 1 - pose.squash * 0.018)
            context.translateBy(x: -256, y: -256)

            let disk = Path(ellipseIn: CGRect(x: 58, y: 58, width: 396, height: 396))
            context.drawLayer { shadow in
                shadow.addFilter(.shadow(color: .black.opacity(min(0.3, max(0, shadowOpacity))),
                                         radius: 18, x: 0, y: 13))
                shadow.fill(disk, with: .color(surface))
            }
            // A barely visible lower hemisphere gives the shadow a surface.
            context.fill(disk, with: .linearGradient(
                Gradient(colors: [.black.opacity(0), .black.opacity(0.018)]),
                startPoint: CGPoint(x: 180, y: 160), endPoint: CGPoint(x: 315, y: 450)))

            let yaw = pose.head.x * 0.22
            let pitch = pose.head.y * 0.14
            func point(_ x: Double, _ y: Double, _ depth: Double = 52) -> CGPoint {
                CGPoint(x: 256 + (x - 256) * cos(yaw) + depth * sin(yaw),
                        y: 256 + (y - 256) * cos(pitch) + depth * sin(pitch))
            }
            func brow(_ x: Double, _ y: Double) -> CGPoint {
                point(x, y - pose.browLift, 45)
            }

            func stroke(_ path: Path, width: Double = 17) {
                context.stroke(path, with: .color(ink),
                               style: StrokeStyle(lineWidth: width, lineCap: .round, lineJoin: .round))
            }
            func eye(_ x: Double, _ y: Double, width: Double, height: Double,
                     angle: Double = 0, closure: Double) {
                let center = point(x, y, 64)
                let w = width * (1 + closure * 0.04)
                let h = max(3.5, height * (1 - closure * 0.94))
                var local = context
                local.translateBy(x: center.x + pose.eyes.x * 6,
                                  y: center.y + pose.eyes.y * 4)
                local.rotate(by: .radians(angle))
                local.fill(Path(ellipseIn: CGRect(x: -w / 2, y: -h / 2, width: w, height: h)),
                           with: .color(ink))
            }

            switch style {
            case .loop:
                // A single short brow and a rounded, detached nose keep this
                // face open and friendly. None of the features share a contour.
                var eyebrow = Path()
                eyebrow.move(to: brow(176, 186))
                eyebrow.addCurve(to: brow(215, 184), control1: brow(189, 177), control2: brow(204, 177))
                stroke(eyebrow, width: 14)

                var nose = Path()
                nose.move(to: point(260, 209, 72))
                nose.addCurve(to: point(246, 270, 90), control1: point(263, 235, 78), control2: point(246, 250, 86))
                nose.addCurve(to: point(278, 280, 90), control1: point(243, 290, 92), control2: point(266, 297, 92))
                stroke(nose, width: 17)

                var smile = Path()
                smile.move(to: point(226, 332, 60))
                smile.addCurve(to: point(290, 328, 60), control1: point(244, 350, 64), control2: point(273, 350, 64))
                stroke(smile, width: 14)

                eye(195, 231, width: 28, height: 39, angle: -0.05, closure: pose.leftBlink)
                eye(316, 225, width: 28, height: 39, angle: 0.05, closure: pose.rightBlink)

            case .tilt:
                // Uneven eyes, a compact angular nose, and a little side-smile
                // make this more graphic and mischievous without extra detail.
                var nose = Path()
                nose.move(to: point(266, 209, 72))
                nose.addLine(to: point(239, 281, 92))
                nose.addQuadCurve(to: point(246, 293, 92), control: point(235, 292, 94))
                nose.addLine(to: point(277, 293, 88))
                stroke(nose, width: 18)

                var smile = Path()
                smile.move(to: point(273, 339, 60))
                smile.addCurve(to: point(311, 316, 60), control1: point(288, 342, 62), control2: point(306, 333, 62))
                stroke(smile, width: 15)

                eye(191, 211, width: 34, height: 47, angle: -0.14, closure: pose.leftBlink)
                eye(319, 239, width: 37, height: 34, angle: 0.06, closure: pose.rightBlink)
            }

        }
        .accessibilityHidden(true)
    }
}

private enum MinimalFaceMotion {
    struct Gaze {
        var x: Double
        var y: Double
        func mixed(with target: Gaze, weight: Double) -> Gaze {
            Gaze(x: x + (target.x - x) * weight, y: y + (target.y - y) * weight)
        }
    }
    struct Pose {
        let head: Gaze
        let eyes: Gaze
        let leftBlink: Double
        let rightBlink: Double
        let browLift: Double
        let lift: Double
        let roll: Double
        let squash: Double
    }
    private struct Key {
        let time: Double
        let gaze: Gaze
        init(_ t: Double, _ x: Double, _ y: Double) { time = t; gaze = Gaze(x: x, y: y) }
    }
    private static let keys: [Key] = [
        .init(0, 0, 0), .init(0.7, 0, 0),
        .init(1.3, -0.85, -0.1), .init(2.1, -0.85, -0.1),
        .init(2.75, -0.35, -0.65), .init(3.25, -0.35, -0.65),
        .init(4.1, 0, 0), .init(4.7, 0, 0),
        .init(5.4, 0.9, -0.15), .init(6.5, 0.9, -0.15),
        .init(7.1, 0.5, 0.45), .init(7.5, 0.5, 0.45),
        .init(8.3, 0, 0), .init(9.6, 0, 0),
        .init(10.15, -0.35, 0.05), .init(10.65, -0.35, 0.05),
        .init(11.35, 0, 0), .init(12, 0, 0)
    ]

    static func pose(time: Double, reactionAge: Double?) -> Pose {
        let t = time.isFinite ? max(0, time) : 0
        let phase = t.truncatingRemainder(dividingBy: 12)
        let age = reactionAge.flatMap { $0.isFinite && $0 >= 0 ? $0 : nil } ?? 99
        let attention = smooth(age / 0.16) * (1 - smooth((age - 0.68) / 0.52))
        let target = Gaze(x: 0.12, y: -0.18)
        let eyes = gaze(at: t).mixed(with: target, weight: attention)
        let head = gaze(at: t - 0.11).mixed(with: target, weight: attention)
        let blink = [(0.43, 0.18), (3.67, 0.20), (6.37, 0.17), (9.18, 0.21), (9.47, 0.16)]
            .map { pulse(phase, start: $0.0, duration: $0.1) }.max() ?? 0
        let wink = pulse(age, start: 0.17, duration: 0.34)
        let replyBlink = pulse(age, start: 0.69, duration: 0.16)
        let nod = pulse(age, start: 0.05, duration: 0.62)
        let settle = pulse(age, start: 0.67, duration: 0.42)
        return Pose(
            head: head, eyes: eyes,
            leftBlink: max(blink * (1 - attention), replyBlink),
            rightBlink: max(blink * (1 - attention), max(wink, replyBlink)),
            browLift: 6 * attention + 1.5 * max(0, -head.y),
            lift: 2 * sin(t * .pi / 6) - 7 * nod + 1.4 * settle,
            roll: head.x * 0.023 - nod * 0.045 + settle * 0.012,
            squash: nod
        )
    }

    private static func gaze(at time: Double) -> Gaze {
        let t = (time.truncatingRemainder(dividingBy: 12) + 12).truncatingRemainder(dividingBy: 12)
        let index = (0..<keys.count - 1).first { t < keys[$0 + 1].time } ?? keys.count - 2
        let a = keys[index], b = keys[index + 1]
        return a.gaze.mixed(with: b.gaze, weight: smooth((t - a.time) / (b.time - a.time)))
    }

    /// Zero velocity and acceleration at each look/hold boundary.
    private static func smooth(_ value: Double) -> Double {
        let u = min(1, max(0, value))
        return u * u * u * (10 + u * (-15 + 6 * u))
    }

    private static func pulse(_ time: Double, start: Double, duration: Double) -> Double {
        let u = (time - start) / duration
        guard u > 0 && u < 1 else { return 0 }
        return pow(sin(.pi * u), 2)
    }
}

struct MinimalFaceVariationsPreview: View {
    var body: some View {
        VStack(spacing: 24) {
            ForEach(MinimalFaceStyle.allCases, id: \.self) { style in
                VStack(spacing: 0) {
                    MinimalFace(style: style)
                        .frame(width: 242, height: 242)
                    Text(style.rawValue)
                        .font(.system(size: 15, weight: .medium))
                        .foregroundStyle(.black.opacity(0.55))
                }
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.white.ignoresSafeArea())
    }
}

struct MinimalFaceVariations_Previews: PreviewProvider {
    static var previews: some View { MinimalFaceVariationsPreview() }
}
