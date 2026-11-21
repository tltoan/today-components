import SwiftUI

/// Today landing intro, translated from the refined Sable choreography.
/// Figma: Xf03CH47k7G0graqTZ4zis / 516:8169. iOS 17+ / macOS 14+.
/// Exact outlined Test The Future Black wordmark; no font or asset dependency.
struct TodayIntro: View {
    var isPlaying = true
    var speed: Double = 1
    var loops = false
    var replayToken = 0

    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @Environment(\.scenePhase) private var scenePhase
    @State private var start: Date?
    @State private var elapsed: Double = 0
    @State private var visible = false

    private var rate: Double { min(2, max(0.1, speed)) }

    var body: some View {
        TimelineView(.animation(minimumInterval: 1 / 60, paused: start == nil)) { timeline in
            let seconds = elapsed + (start.map { max(0, timeline.date.timeIntervalSince($0)) * rate } ?? 0)
            TodayIntroArtwork(time: reduceMotion ? TodayIntroArtwork.duration : seconds,
                              loops: loops && !reduceMotion)
                .onChange(of: !loops && seconds >= TodayIntroArtwork.duration) { _, done in
                    if done { elapsed = TodayIntroArtwork.duration; start = nil }
                }
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Today")
        .onAppear { visible = true; updateClock() }
        .onDisappear { visible = false; updateClock() }
        .onChange(of: isPlaying) { _, _ in updateClock() }
        .onChange(of: scenePhase) { _, _ in updateClock() }
        .onChange(of: reduceMotion) { _, _ in updateClock() }
        .onChange(of: loops) { _, _ in updateClock() }
        .onChange(of: replayToken) { _, _ in elapsed = 0; start = nil; updateClock() }
        .onChange(of: speed) { oldSpeed, _ in
            if let start {
                elapsed += max(0, Date.now.timeIntervalSince(start)) * min(2, max(0.1, oldSpeed))
                self.start = .now
            }
        }
    }

    private func updateClock() {
        let finished = !loops && elapsed >= TodayIntroArtwork.duration
        if visible && isPlaying && !reduceMotion && scenePhase == .active && !finished {
            if start == nil { start = .now }
        } else if let start {
            elapsed += max(0, Date.now.timeIntervalSince(start)) * rate
            self.start = nil
        }
    }
}

/// Deterministic rendering shared by live playback, scrubbing, and the movie export.
struct TodayIntroArtwork: View {
    static let duration = 4.0
    static let referenceSize = CGSize(width: 390, height: 844)
    var time: Double = 0
    var loops = false
    // Optional placement for the full welcome-screen handoff. Defaults preserve
    // the approved standalone intro without changing its drawing or timing.
    var wordmarkScale: Double = 1
    var wordmarkTranslation: CGSize = .zero
    var wordmarkInk: GraphicsContext.Shading? = nil

    var body: some View {
        Canvas { context, size in
            context.fill(Path(CGRect(origin: .zero, size: size)), with: .color(.black))
            let t = loops ? max(0, time).truncatingRemainder(dividingBy: Self.duration)
                          : min(Self.duration, max(0, time))
            let letteringTime = t + TodayChoreography.letterTimeOffset
            let drop = TodayChoreography.drop(at: letteringTime)
            TodayChoreography.drawBackground(drop: drop, size: size, in: context)

            // Uniform scaling preserves the exact Figma outlines and tracking.
            let scale = min(size.width / 390, size.height / 844)
            context.translateBy(x: (size.width - 390 * scale) / 2,
                                y: (size.height - 844 * scale) / 2)
            context.scaleBy(x: scale, y: scale)
            context.translateBy(x: wordmarkTranslation.width, y: wordmarkTranslation.height)
            context.scaleBy(x: wordmarkScale, y: wordmarkScale)
            let ink = wordmarkInk ?? TodayWordmark.ink

            // Begin empty, then draw once. The original entrance curves are shifted
            // earlier so only a short black beat precedes the first stroke.
            for index in 0..<5 {
                TodayChoreography.drawLetter(index, progress: TodayChoreography.entrances[index].value(letteringTime),
                    offset: TodayChoreography.lift(letteringTime - 0.533333 - Double(index) * 0.1), ink: ink, in: context)
            }
            TodayChoreography.drawPeriod(drop: drop, ink: ink, in: context)
        }
        .clipped()
        .accessibilityHidden(true)
    }
}

private struct TodayCurve {
    let keys: [(Double, Double)]
    let slopes: [Double]

    init(_ keys: [(Double, Double)]) {
        self.keys = keys
        let h = (0..<keys.count - 1).map { keys[$0 + 1].0 - keys[$0].0 }
        let d = h.indices.map { (keys[$0 + 1].1 - keys[$0].1) / h[$0] }
        var m = [Double](repeating: 0, count: keys.count)
        if keys.count > 2 {
            for i in 1..<keys.count - 1 where d[i - 1] * d[i] > 0 {
                let a = 2 * h[i] + h[i - 1], b = h[i] + 2 * h[i - 1]
                m[i] = (a + b) / (a / d[i - 1] + b / d[i])
            }
        }
        slopes = m
    }

    func value(_ time: Double) -> Double {
        guard time > keys[0].0 else { return keys[0].1 }
        guard time < keys.last!.0 else { return keys.last!.1 }
        let i = (0..<keys.count - 1).first { time < keys[$0 + 1].0 }!
        let h = keys[i + 1].0 - keys[i].0
        let u = (time - keys[i].0) / h, u2 = u * u, u3 = u2 * u
        return (2*u3 - 3*u2 + 1) * keys[i].1 + (u3 - 2*u2 + u) * h * slopes[i]
             + (-2*u3 + 3*u2) * keys[i + 1].1 + (u3 - u2) * h * slopes[i + 1]
    }
}

private enum TodayChoreography {
    static let letterTimeOffset = 0.33
    static let periodStartTime = 1.267
    static let periodImpactTime = periodStartTime + 0.90
    static let periodSettledTime = periodStartTime + 1.08

    // One sample drives BOTH layers: identical acceleration, impact, rebound,
    // and settling. The gradient has no separate delay, duration, or easing.
    struct DropState {
        let y: Double
        let reveal: Double
        let stretch: Double
        let settled: Bool
    }

    static func drop(at time: Double) -> DropState {
        DropState(y: periodY.value(time),
                  reveal: smooth((time - periodStartTime) / 0.05),
                  stretch: periodHeight.value(time) / 22.8,
                  settled: time >= periodSettledTime)
    }

    static let entrances = [
        TodayCurve([(0.53,0), (0.60,0.03), (0.667,0.145), (0.733,0.428), (0.80,0.645),
            (0.90,0.815), (1.0,0.908), (1.10,0.967), (1.20,0.99), (1.35,1)]),
        TodayCurve([(0.62,0), (0.70,0.073), (0.767,0.23), (0.833,0.545), (0.90,0.74),
            (0.967,0.85), (1.067,0.93), (1.20,0.98), (1.35,1)]),
        TodayCurve([(0.70,0), (0.80,0.038), (0.90,0.09), (1.0,0.16), (1.10,0.25),
            (1.167,0.42), (1.233,0.61), (1.30,0.74), (1.40,0.86), (1.50,0.96), (1.60,1)]),
        TodayCurve([(0.80,0), (0.90,0.09), (1.0,0.23), (1.10,0.407), (1.20,0.583),
            (1.30,0.76), (1.40,0.90), (1.50,0.985), (1.567,1)]),
        TodayCurve([(0.85,0), (0.933,0.125), (1.0,0.27), (1.067,0.50), (1.133,0.683),
            (1.20,0.79), (1.30,0.883), (1.40,0.94), (1.50,0.98), (1.633,1)])
    ]
    // Spread the travel across the whole descent so the light visibly slides.
    // Continuous-velocity interpolation gives a gentle launch and a soft landing.
    static let periodY = TodayCurve([
        (periodStartTime,-72), (periodStartTime + 0.12,-68),
        (periodStartTime + 0.32,-51), (periodStartTime + 0.58,-23),
        (periodStartTime + 0.78,-5), (periodImpactTime,0),
        (periodStartTime + 0.97,1), (periodSettledTime,0)
    ])
    // A modest stretch suits the slower shared slide; squash gently on landing.
    static let periodHeight = TodayCurve([
        (periodStartTime,0), (periodStartTime + 0.06,22.8),
        (periodStartTime + 0.35,25.5), (periodStartTime + 0.58,31),
        (periodStartTime + 0.78,27), (periodImpactTime,22.8),
        (periodStartTime + 0.97,21.5), (periodSettledTime,22.8)
    ])


    static func smooth(_ value: Double) -> Double {
        let x = min(1, max(0, value))
        return x * x * x * (x * (x * 6 - 15) + 10)
    }

    static func lift(_ time: Double) -> Double {
        // Same Sable displacement curve, scaled to Today's 45 pt ascender.
        let factor = 0.465
        if time < 0.20 { return (-22 + 39 * pow(max(0, 1 - time / 0.20), 3)) * factor }
        if time < 0.52 { return (-22 + 31 * smooth((time - 0.20) / 0.32)) * factor }
        return 9 * (1 - smooth((time - 0.52) / 0.30)) * factor
    }

    static func drawBackground(drop: DropState, size: CGSize, in context: GraphicsContext) {
        guard drop.reveal > 0 else { return }
        var background = context
        background.opacity = drop.reveal
        background.drawLayer { glow in
            // Composite the complete Figma paint stack before fading the layer.
            // Fading each paint separately would let color leak through the black fade.
            glow.opacity = 1
            glow.scaleBy(x: size.width / 390, y: size.height / 844)
            // Map the dot's 72-unit travel to the light's 560-point travel.
            // Preserve its tiny rebound too. Extend above the viewport so that
            // rebound never exposes a black strip along the top edge.
            glow.translateBy(x: 0, y: drop.y * (560 / 72))
            // Overscan below as well, keeping the paint edge offscreen throughout
            // the descent and preventing an antialiased horizontal seam.
            let rect = Path(CGRect(x: 0, y: -64, width: 390, height: 1600))
            // Figma frame is translucent over its parent (#0E0D11).
            glow.fill(rect, with: .color(Color(red: 14/255, green: 13/255, blue: 17/255)))
            glow.fill(rect, with: .linearGradient(Gradient(stops: [
                .init(color: Color(red: 94/255, green: 145/255, blue: 246/255).opacity(0.25), location: 0),
                .init(color: Color(red: 167/255, green: 129/255, blue: 240/255).opacity(0.25), location: 0.51),
                .init(color: Color(red: 1, green: 178/255, blue: 118/255).opacity(0.25), location: 1)
            ]), startPoint: CGPoint(x: 12.5, y: 643.5), endPoint: CGPoint(x: 390, y: 655)))
            glow.fill(rect, with: .linearGradient(Gradient(stops: [
                .init(color: .black.opacity(0.14), location: 0),
                .init(color: .black.opacity(0.36), location: 0.0817967),
                .init(color: .black.opacity(0.86), location: 0.544617),
                .init(color: .black, location: 0.744265),
                .init(color: .black, location: 1)
            ]), startPoint: CGPoint(x: 195, y: 16.5), endPoint: CGPoint(x: 195, y: 844)))
        }
    }

    static func drawLetter(_ index: Int, progress: Double, offset: Double,
                           ink: GraphicsContext.Shading, in context: GraphicsContext) {
        guard progress > 0 else { return }
        var letter = context
        letter.translateBy(x: 0, y: offset)
        let glyph = TodayWordmark.glyphs[index]
        if progress >= 0.99999 {
            letter.fill(glyph, with: ink, style: FillStyle(eoFill: true))
            return
        }
        letter.clip(to: glyph, style: FillStyle(eoFill: true))
        for stroke in TodayWordmark.strokes[index] {
            let p = min(1, max(0, (progress - stroke.start) / (stroke.end - stroke.start)))
            if p > 0 {
                letter.stroke(stroke.path.trimmedPath(from: 0, to: p), with: ink,
                              style: StrokeStyle(lineWidth: stroke.width, lineCap: .butt, lineJoin: .round))
            }
        }
        // Fade in only the final tracing tolerances; the letters themselves draw on.
        if progress > 0.94 {
            letter.opacity = smooth((progress - 0.94) / 0.06)
            letter.fill(glyph, with: ink, style: FillStyle(eoFill: true))
        }
    }

    static func drawPeriod(drop: DropState, ink: GraphicsContext.Shading, in context: GraphicsContext) {
        guard drop.reveal > 0 else { return }
        let glyph = TodayWordmark.glyphs[5]
        if drop.settled { context.fill(glyph, with: ink); return }
        let bounds = glyph.boundingRect
        var dot = context
        dot.translateBy(x: bounds.midX, y: bounds.midY + drop.y * 0.465)
        dot.scaleBy(x: drop.reveal, y: max(0.0001, drop.stretch))
        dot.translateBy(x: -bounds.midX, y: -bounds.midY)
        dot.fill(glyph, with: ink)
    }
}

/// Optional review controls; the production TodayIntro contains no controls.
struct TodayIntroPreview: View {
    @State private var replay = 0
    @State private var playing = true
    @State private var speed = 1.0

    var body: some View {
        TodayIntro(isPlaying: playing, speed: speed, replayToken: replay)
            .ignoresSafeArea()
            .overlay(alignment: .bottom) {
                HStack(spacing: 28) {
                    Button { replay += 1; playing = true } label: {
                        Label("Replay", systemImage: "arrow.counterclockwise").frame(minHeight: 44)
                    }
                    Button { playing.toggle() } label: {
                        Image(systemName: playing ? "pause.fill" : "play.fill")
                            .frame(minWidth: 44, minHeight: 44)
                    }.accessibilityLabel(playing ? "Pause" : "Play")
                    Button { speed = speed == 1 ? 0.5 : 1 } label: {
                        Text(speed == 1 ? "0.5×" : "1×").frame(minWidth: 44, minHeight: 44)
                    }.accessibilityLabel(speed == 1 ? "Play at half speed" : "Play at normal speed")
                }
                .font(.system(size: 14, weight: .medium))
                .buttonStyle(.plain)
                .foregroundStyle(.white.opacity(0.72))
                .frame(height: 48)
                .padding(.horizontal, 24)
                .background(.ultraThinMaterial, in: Capsule())
                .padding(.bottom, 22)
            }
            .preferredColorScheme(.dark)
    }
}

struct TodayIntro_Previews: PreviewProvider {
    static var previews: some View {
        TodayIntroPreview().frame(width: 390, height: 844)
    }
}

private enum TodayWordmark {
    static let ink = GraphicsContext.Shading.linearGradient(Gradient(stops: [
        .init(color: Color(white: 0.8396183848), location: 0),
        .init(color: Color(white: 0.5191368461), location: 1)
    ]), startPoint: CGPoint(x: 98.9926, y: 291.54), endPoint: CGPoint(x: 273.291, y: 341.08))

    struct Stroke {
        let path: Path
        let width: Double
        var start: Double = 0
        var end: Double = 1
    }

    // Stroke masks follow each letter's own construction, clipped to the original
    // Figma outline. They reveal its full weight rather than drawing a thin outline.
    static let strokes: [[Stroke]] = [
        [Stroke(path: line(98.175, 288.0, 98.175, 327), width: 10.4, end: 0.78),
         Stroke(path: line(88, 301.91, 110, 301.91), width: 8.9, start: 0.22)],
        [Stroke(path: oval(cx: 133.858, cy: 311.755, rx: 10.89, ry: 10.61, fromTop: true), width: 10.6)],
        [Stroke(path: line(187.394, 281, 187.394, 327), width: 10.4, end: 0.38),
         Stroke(path: oval(cx: 176.339, cy: 311.755, rx: 11.25, ry: 10.61, fromTop: false), width: 10.8, start: 0.22)],
        [Stroke(path: oval(cx: 220.522, cy: 311.755, rx: 11.25, ry: 10.61, fromTop: true), width: 10.8, end: 0.88),
         Stroke(path: line(231.577, 297, 231.577, 327), width: 10.4, start: 0.58)],
        [Stroke(path: line(251.8, 296.5, 263.77, 319.6), width: 10.4, end: 0.40),
         Stroke(path: line(275.4, 296.5, 252.3, 341), width: 10.1, start: 0.23)]
    ]

    static func line(_ x1: Double, _ y1: Double, _ x2: Double, _ y2: Double) -> Path {
        var p = Path(); p.move(to: CGPoint(x: x1, y: y1)); p.addLine(to: CGPoint(x: x2, y: y2)); return p
    }

    static func oval(cx: Double, cy: Double, rx: Double, ry: Double, fromTop: Bool) -> Path {
        // Cubic quarter arcs; clockwise from the top or from the right stem.
        var p = Path()
        let k = 0.55228475
        let start = fromTop ? -Double.pi / 2 : 0.0
        func point(_ theta: Double) -> CGPoint { CGPoint(x: cx + rx * cos(theta), y: cy + ry * sin(theta)) }
        p.move(to: point(start))
        for i in 0..<4 {
            let a = start + Double(i) * .pi / 2, b = a + .pi / 2
            let p1 = point(a), p2 = point(b)
            p.addCurve(to: p2,
                       control1: CGPoint(x: p1.x - k * rx * sin(a), y: p1.y + k * ry * cos(a)),
                       control2: CGPoint(x: p2.x + k * rx * sin(b), y: p2.y - k * ry * cos(b)))
        }
        return p
    }

    // Verbatim vector geometry exported from text node 516:8171.
    // 55 pt Test The Future Black, 15% tracking; ink bounds x88.44…298.189,
    // y281.67…339.75 on the 390 × 844 frame. Counters stay transparent.
    static let glyphs: [Path] = [
        {
            var p = Path()
            p.move(to: CGPoint(x: 88.44, y: 306.31))
            p.addLine(to: CGPoint(x: 88.44, y: 297.51))
            p.addLine(to: CGPoint(x: 93.06, y: 297.51))
            p.addLine(to: CGPoint(x: 93.06, y: 288.71))
            p.addLine(to: CGPoint(x: 103.29, y: 288.71))
            p.addLine(to: CGPoint(x: 103.29, y: 297.51))
            p.addLine(to: CGPoint(x: 108.955, y: 297.51))
            p.addLine(to: CGPoint(x: 108.955, y: 306.31))
            p.addLine(to: CGPoint(x: 103.29, y: 306.31))
            p.addLine(to: CGPoint(x: 103.29, y: 326))
            p.addLine(to: CGPoint(x: 93.06, y: 326))
            p.addLine(to: CGPoint(x: 93.06, y: 306.31))
            p.addLine(to: CGPoint(x: 88.44, y: 306.31))
            p.closeSubpath()
            return p
        }(),
        {
            var p = Path()
            p.move(to: CGPoint(x: 118.238, y: 311.755))
            p.addCurve(to: CGPoint(x: 133.858, y: 296.85), control1: CGPoint(x: 118.238, y: 303.01), control2: CGPoint(x: 125.498, y: 296.85))
            p.addCurve(to: CGPoint(x: 149.478, y: 311.755), control1: CGPoint(x: 142.218, y: 296.85), control2: CGPoint(x: 149.478, y: 303.01))
            p.addCurve(to: CGPoint(x: 133.858, y: 326.66), control1: CGPoint(x: 149.478, y: 320.5), control2: CGPoint(x: 142.218, y: 326.66))
            p.addCurve(to: CGPoint(x: 118.238, y: 311.755), control1: CGPoint(x: 125.498, y: 326.66), control2: CGPoint(x: 118.238, y: 320.5))
            p.closeSubpath()
            p.move(to: CGPoint(x: 127.698, y: 311.755))
            p.addCurve(to: CGPoint(x: 133.858, y: 318.025), control1: CGPoint(x: 127.698, y: 315.275), control2: CGPoint(x: 130.283, y: 318.025))
            p.addCurve(to: CGPoint(x: 140.018, y: 311.755), control1: CGPoint(x: 137.433, y: 318.025), control2: CGPoint(x: 140.018, y: 315.275))
            p.addCurve(to: CGPoint(x: 133.858, y: 305.485), control1: CGPoint(x: 140.018, y: 308.235), control2: CGPoint(x: 137.433, y: 305.485))
            p.addCurve(to: CGPoint(x: 127.698, y: 311.755), control1: CGPoint(x: 130.283, y: 305.485), control2: CGPoint(x: 127.698, y: 308.235))
            p.closeSubpath()
            return p
        }(),
        {
            var p = Path()
            p.move(to: CGPoint(x: 182.279, y: 281.67))
            p.addLine(to: CGPoint(x: 192.509, y: 281.67))
            p.addLine(to: CGPoint(x: 192.509, y: 326))
            p.addLine(to: CGPoint(x: 182.279, y: 326))
            p.addLine(to: CGPoint(x: 182.279, y: 323.25))
            p.addCurve(to: CGPoint(x: 173.974, y: 326.66), control1: CGPoint(x: 180.739, y: 324.9), control2: CGPoint(x: 177.934, y: 326.66))
            p.addCurve(to: CGPoint(x: 160.004, y: 311.755), control1: CGPoint(x: 166.384, y: 326.66), control2: CGPoint(x: 160.004, y: 320.335))
            p.addCurve(to: CGPoint(x: 173.974, y: 296.85), control1: CGPoint(x: 160.004, y: 303.175), control2: CGPoint(x: 166.384, y: 296.85))
            p.addCurve(to: CGPoint(x: 182.279, y: 300.26), control1: CGPoint(x: 177.934, y: 296.85), control2: CGPoint(x: 180.739, y: 298.61))
            p.addLine(to: CGPoint(x: 182.279, y: 281.67))
            p.closeSubpath()
            p.move(to: CGPoint(x: 170.179, y: 311.755))
            p.addCurve(to: CGPoint(x: 176.339, y: 318.025), control1: CGPoint(x: 170.179, y: 315.275), control2: CGPoint(x: 172.764, y: 318.025))
            p.addCurve(to: CGPoint(x: 182.499, y: 311.755), control1: CGPoint(x: 179.914, y: 318.025), control2: CGPoint(x: 182.499, y: 315.275))
            p.addCurve(to: CGPoint(x: 176.339, y: 305.485), control1: CGPoint(x: 182.499, y: 308.235), control2: CGPoint(x: 179.914, y: 305.485))
            p.addCurve(to: CGPoint(x: 170.179, y: 311.755), control1: CGPoint(x: 172.764, y: 305.485), control2: CGPoint(x: 170.179, y: 308.235))
            p.closeSubpath()
            return p
        }(),
        {
            var p = Path()
            p.move(to: CGPoint(x: 226.462, y: 297.51))
            p.addLine(to: CGPoint(x: 236.692, y: 297.51))
            p.addLine(to: CGPoint(x: 236.692, y: 326))
            p.addLine(to: CGPoint(x: 226.462, y: 326))
            p.addLine(to: CGPoint(x: 226.462, y: 323.25))
            p.addCurve(to: CGPoint(x: 218.157, y: 326.66), control1: CGPoint(x: 224.922, y: 324.9), control2: CGPoint(x: 222.117, y: 326.66))
            p.addCurve(to: CGPoint(x: 204.187, y: 311.755), control1: CGPoint(x: 210.567, y: 326.66), control2: CGPoint(x: 204.187, y: 320.335))
            p.addCurve(to: CGPoint(x: 218.157, y: 296.85), control1: CGPoint(x: 204.187, y: 303.175), control2: CGPoint(x: 210.567, y: 296.85))
            p.addCurve(to: CGPoint(x: 226.462, y: 300.26), control1: CGPoint(x: 222.117, y: 296.85), control2: CGPoint(x: 224.922, y: 298.61))
            p.addLine(to: CGPoint(x: 226.462, y: 297.51))
            p.closeSubpath()
            p.move(to: CGPoint(x: 214.362, y: 311.755))
            p.addCurve(to: CGPoint(x: 220.522, y: 318.025), control1: CGPoint(x: 214.362, y: 315.275), control2: CGPoint(x: 216.947, y: 318.025))
            p.addCurve(to: CGPoint(x: 226.682, y: 311.755), control1: CGPoint(x: 224.097, y: 318.025), control2: CGPoint(x: 226.682, y: 315.275))
            p.addCurve(to: CGPoint(x: 220.522, y: 305.485), control1: CGPoint(x: 226.682, y: 308.235), control2: CGPoint(x: 224.097, y: 305.485))
            p.addCurve(to: CGPoint(x: 214.362, y: 311.755), control1: CGPoint(x: 216.947, y: 305.485), control2: CGPoint(x: 214.362, y: 308.235))
            p.closeSubpath()
            return p
        }(),
        {
            var p = Path()
            p.move(to: CGPoint(x: 247.489, y: 339.75))
            p.addLine(to: CGPoint(x: 258.324, y: 320.06))
            p.addLine(to: CGPoint(x: 246.499, y: 297.51))
            p.addLine(to: CGPoint(x: 257.554, y: 297.51))
            p.addLine(to: CGPoint(x: 263.769, y: 309.83))
            p.addLine(to: CGPoint(x: 269.929, y: 297.51))
            p.addLine(to: CGPoint(x: 280.819, y: 297.51))
            p.addLine(to: CGPoint(x: 258.104, y: 339.75))
            p.addLine(to: CGPoint(x: 247.489, y: 339.75))
            p.closeSubpath()
            return p
        }(),
        {
            var p = Path()
            p.move(to: CGPoint(x: 285.319, y: 320.115))
            p.addCurve(to: CGPoint(x: 291.754, y: 313.735), control1: CGPoint(x: 285.319, y: 316.485), control2: CGPoint(x: 288.179, y: 313.735))
            p.addCurve(to: CGPoint(x: 298.189, y: 320.115), control1: CGPoint(x: 295.329, y: 313.735), control2: CGPoint(x: 298.189, y: 316.485))
            p.addCurve(to: CGPoint(x: 291.754, y: 326.495), control1: CGPoint(x: 298.189, y: 323.745), control2: CGPoint(x: 295.329, y: 326.495))
            p.addCurve(to: CGPoint(x: 285.319, y: 320.115), control1: CGPoint(x: 288.179, y: 326.495), control2: CGPoint(x: 285.319, y: 323.745))
            p.closeSubpath()
            return p
        }()
    ]
}
