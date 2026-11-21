import SwiftUI

/// Standalone Today logo animation. iOS 17+ / macOS 14+.
/// Includes the approved letter drawing, settling, and falling period.
/// The first t uses the supplied curved Figma silhouette with a solid fill.
/// yStyle selects the new curved y or the previous diagonal y.
/// Transparent background; no font, image, package, or other source dependency.
///
/// Usage:
///     TodayLogoCurvedAnimation()
///         .frame(width: 240, height: 100)
///
/// Runs once, then holds the completed logo. Change replayToken to replay.
/// Set isPlaying to pause/resume, speed to adjust playback, or loops to repeat.
/// Reduce Motion displays the completed logo immediately.
enum TodayLogoCurvedYStyle: String, CaseIterable {
    case original
    case curved
}

struct TodayLogoCurvedAnimation: View {
    var yStyle: TodayLogoCurvedYStyle = .curved
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
            TodayLogoCurvedArtwork(time: reduceMotion ? TodayLogoCurvedArtwork.duration : seconds,
                              loops: loops && !reduceMotion, yStyle: yStyle)
                .onChange(of: !loops && seconds >= TodayLogoCurvedArtwork.duration) { _, done in
                    if done { elapsed = TodayLogoCurvedArtwork.duration; start = nil }
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
        let finished = !loops && elapsed >= TodayLogoCurvedArtwork.duration
        if visible && isPlaying && !reduceMotion && scenePhase == .active && !finished {
            if start == nil { start = .now }
        } else if let start {
            elapsed += max(0, Date.now.timeIntervalSince(start)) * rate
            self.start = nil
        }
    }
}

/// Transparent, uniformly scaled artwork. The extra space accommodates the
/// moving tips and falling period, so the animation never clips its own strokes.
private struct TodayLogoCurvedArtwork: View {
    static let duration = 2.10
    var time: Double = 0
    var loops = false
    var yStyle: TodayLogoCurvedYStyle = .curved

    var body: some View {
        Canvas { context, size in
            let scale = min(size.width / 240, size.height / 100)
            context.translateBy(x: size.width / 2, y: size.height / 2)
            context.scaleBy(x: scale, y: scale)
            let periodShift = yStyle == .curved ? TodayLogoCurvedWordmark.curvedYPeriodShift : 0
            context.translateBy(x: -193.3145 - periodShift / 2, y: -310.71)

            let t = loops ? max(0, time).truncatingRemainder(dividingBy: Self.duration)
                          : min(Self.duration, max(0, time))
            let letteringTime = t + TodayLogoCurvedChoreography.letterTimeOffset
            let drop = TodayLogoCurvedChoreography.drop(at: letteringTime)
            let ink = TodayLogoCurvedWordmark.ink
            for index in 0..<5 {
                if index == 4 && yStyle == .curved {
                    TodayLogoCurvedChoreography.drawCurvedY(at: letteringTime,
                        offset: TodayLogoCurvedChoreography.lift(letteringTime - 0.533333 - 0.4),
                        ink: ink, in: context)
                    continue
                }
                TodayLogoCurvedChoreography.drawLetter(index,
                    progress: TodayLogoCurvedChoreography.entrances[index].value(letteringTime),
                    offset: TodayLogoCurvedChoreography.lift(letteringTime - 0.533333 - Double(index) * 0.1),
                    ink: index == 0 ? TodayLogoCurvedWordmark.tInk : ink, yStyle: yStyle, in: context)
            }
            TodayLogoCurvedChoreography.drawPeriod(drop: drop, ink: ink, yStyle: yStyle, in: context)
        }
        .aspectRatio(2.4, contentMode: .fit)
        .clipped()
        .accessibilityHidden(true)
    }
}

private struct TodayLogoCurvedCurve {
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

private enum TodayLogoCurvedChoreography {
    static let letterTimeOffset = 0.33
    static let periodStartTime = 1.267
    static let periodImpactTime = periodStartTime + 0.90
    static let periodSettledTime = periodStartTime + 1.08

    // Period motion from the approved Today intro, including its gentle rebound.
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
        TodayLogoCurvedCurve([(0.53,0), (0.60,0.03), (0.667,0.145), (0.733,0.428), (0.80,0.645),
            (0.90,0.815), (1.0,0.908), (1.10,0.967), (1.20,0.99), (1.35,1)]),
        TodayLogoCurvedCurve([(0.62,0), (0.70,0.073), (0.767,0.23), (0.833,0.545), (0.90,0.74),
            (0.967,0.85), (1.067,0.93), (1.20,0.98), (1.35,1)]),
        TodayLogoCurvedCurve([(0.70,0), (0.80,0.038), (0.90,0.09), (1.0,0.16), (1.10,0.25),
            (1.167,0.42), (1.233,0.61), (1.30,0.74), (1.40,0.86), (1.50,0.96), (1.60,1)]),
        TodayLogoCurvedCurve([(0.80,0), (0.90,0.09), (1.0,0.23), (1.10,0.407), (1.20,0.583),
            (1.30,0.76), (1.40,0.90), (1.50,0.985), (1.567,1)]),
        TodayLogoCurvedCurve([(0.85,0), (0.933,0.125), (1.0,0.27), (1.067,0.50), (1.133,0.683),
            (1.20,0.79), (1.30,0.883), (1.40,0.94), (1.50,0.98), (1.633,1)])
    ]
    // Preserve the approved period descent and soft landing.
    static let periodY = TodayLogoCurvedCurve([
        (periodStartTime,-72), (periodStartTime + 0.12,-68),
        (periodStartTime + 0.32,-51), (periodStartTime + 0.58,-23),
        (periodStartTime + 0.78,-5), (periodImpactTime,0),
        (periodStartTime + 0.97,1), (periodSettledTime,0)
    ])
    // Stretch slightly during the fall, then squash gently on landing.
    static let periodHeight = TodayLogoCurvedCurve([
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

    static func drawLetter(_ index: Int, progress: Double, offset: Double,
                           ink: GraphicsContext.Shading, yStyle: TodayLogoCurvedYStyle, in context: GraphicsContext) {
        guard progress > 0 else { return }
        var letter = context
        letter.translateBy(x: 0, y: offset)
        let glyph = yStyle == .curved ? TodayLogoCurvedWordmark.curvedYGlyphs[index] : TodayLogoCurvedWordmark.glyphs[index]
        if progress >= 0.99999 {
            letter.fill(glyph, with: ink, style: FillStyle(eoFill: true))
            return
        }
        letter.clip(to: glyph, style: FillStyle(eoFill: true))
        for stroke in TodayLogoCurvedWordmark.strokes[index] {
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

    static func drawCurvedY(at time: Double, offset: Double,
                            ink: GraphicsContext.Shading, in context: GraphicsContext) {
        guard time > 0.85 else { return }
        var letter = context
        letter.translateBy(x: 0, y: offset)
        if time >= 1.633 {
            letter.fill(TodayLogoCurvedWordmark.curvedY, with: ink)
            return
        }

        // Keep the original y's start/end times. Each pen stroke now has one
        // continuous acceleration/deceleration, including the curl at its end.
        let progress = [smooth((time - 0.85) / 0.49), smooth((time - 0.90) / 0.733)]
        for index in 0..<2 where progress[index] > 0 {
            let stroke = TodayLogoCurvedWordmark.curvedYStrokes[index]
            var segment = letter
            // Separate silhouette clips stop the bowl revealing the descender
            // ahead of the moving pen. Rounded tips soften the live reveal only.
            segment.clip(to: TodayLogoCurvedWordmark.curvedYRevealParts[index])
            segment.stroke(stroke.path.trimmedPath(from: 0, to: progress[index]), with: ink,
                style: StrokeStyle(lineWidth: stroke.width, lineCap: .round, lineJoin: .round))
        }
    }

    static func drawPeriod(drop: DropState, ink: GraphicsContext.Shading, yStyle: TodayLogoCurvedYStyle, in context: GraphicsContext) {
        guard drop.reveal > 0 else { return }
        let glyph = yStyle == .curved ? TodayLogoCurvedWordmark.curvedYGlyphs[5] : TodayLogoCurvedWordmark.glyphs[5]
        if drop.settled { context.fill(glyph, with: ink); return }
        let bounds = glyph.boundingRect
        var dot = context
        dot.translateBy(x: bounds.midX, y: bounds.midY + drop.y * 0.465)
        dot.scaleBy(x: drop.reveal, y: max(0.0001, drop.stretch))
        dot.translateBy(x: -bounds.midX, y: -bounds.midY)
        dot.fill(glyph, with: ink)
    }
}

private enum TodayLogoCurvedWordmark {
    // A flat color matching the original wordmark's light end; no gradient on t.
    static let tInk = GraphicsContext.Shading.color(Color(white: 0.8396183848))
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
        [Stroke(path: roundedTTrace, width: 15, end: 0.78),
         Stroke(path: line(94.6794, 301.35, 109.1794, 301.35), width: 9, start: 0.22)],
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

    static let roundedTTrace: Path = {
        var p = Path()
        p.move(to: CGPoint(x: 5.78915, y: -2))
        p.addLine(to: CGPoint(x: 5.78915, y: 25.5))
        p.addCurve(to: CGPoint(x: 19, y: 36.8),
                   control1: CGPoint(x: 5.78915, y: 34.4), control2: CGPoint(x: 10, y: 36.8))
        return p.applying(CGAffineTransform(translationX: 91.6794, y: 283))
    }()

    // Figma node 594:26509. The crossbar's top is aligned to the o at y=296.85.
    // Its right edge and baseline stay fixed. The crossbar is one solid outline
    // so even-odd filling cannot cut a hole where it overlaps the stem.
    static let roundedT: Path = {
        var p = Path()
        p.move(to: CGPoint(x: 17.2756, y: 30.6304))
        p.addLine(to: CGPoint(x: 17.2756, y: 42.9439))
        p.addCurve(to: CGPoint(x: 14.09, y: 42.9439), control1: CGPoint(x: 17.2756, y: 42.9439), control2: CGPoint(x: 15.3276, y: 43.0701))
        p.addCurve(to: CGPoint(x: 9.5567, y: 41.7799), control1: CGPoint(x: 12.2717, y: 42.7584), control2: CGPoint(x: 11.2556, y: 42.4541))
        p.addCurve(to: CGPoint(x: 6.24861, y: 40.0646), control1: CGPoint(x: 8.20408, y: 41.2432), control2: CGPoint(x: 7.42508, y: 40.9211))
        p.addCurve(to: CGPoint(x: 3.12431, y: 36.7565), control1: CGPoint(x: 4.81202, y: 39.0187), control2: CGPoint(x: 4.1706, y: 38.1928))
        p.addCurve(to: CGPoint(x: 1.16396, y: 33.3259), control1: CGPoint(x: 2.21576, y: 35.5093), control2: CGPoint(x: 1.75346, y: 34.7519))
        p.addCurve(to: CGPoint(x: 0, y: 28.1187), control1: CGPoint(x: 0.367903, y: 31.4003), control2: CGPoint(x: 0, y: 28.1187))
        p.addLine(to: .zero)
        p.addLine(to: CGPoint(x: 11.5783, y: 0))
        p.addLine(to: CGPoint(x: 11.5783, y: 13.85))
        p.addLine(to: CGPoint(x: 17, y: 13.85))
        p.addLine(to: CGPoint(x: 17, y: 22.85))
        p.addLine(to: CGPoint(x: 11.5783, y: 22.85))
        p.addLine(to: CGPoint(x: 11.5783, y: 24.1981))
        p.addCurve(to: CGPoint(x: 12.0071, y: 28.1187), control1: CGPoint(x: 11.5783, y: 24.1981), control2: CGPoint(x: 11.5783, y: 27.0773))
        p.addCurve(to: CGPoint(x: 14.09, y: 30.1404), control1: CGPoint(x: 12.436, y: 29.1602), control2: CGPoint(x: 13.0836, y: 29.6187))
        p.addCurve(to: CGPoint(x: 17.2756, y: 30.6304), control1: CGPoint(x: 15.2075, y: 30.7196), control2: CGPoint(x: 17.2756, y: 30.6304))
        p.closeSubpath()
        return p.applying(CGAffineTransform(translationX: 91.6794, y: 283))
    }()


    // Keep the t's mirrored outer curve; open the y's inside to match o/d/a's weight.
    // Keep the lowercase body at 28.49 pt; the complete y is 42.9439 pt tall,
    // matching the t's total height without making the lowercase bowl oversized.
    static let curvedYScale = 1.0
    // All three round counters are 12.32 pt wide; derive the y from that opening.
    static let curvedYCounterWidth = 140.018 - 127.698
    static let curvedYWidth = 2 * curvedYStemWidth + curvedYCounterWidth
    static let curvedYBodyHeight = 28.49
    static let curvedYHeight = 42.9439
    static let curvedYStemWidth = 10.23
    static let curvedYTerminalWeight = 9.6
    static let curvedYPeriodShift = curvedYWidth - 34.32
    static let curvedYTransform = CGAffineTransform(translationX: 246.499, y: 297.51)

    // The t's outside contour stays exact. The inner curve moves inward so the
    // y has a 10.23 pt stem (like d/a) and an optically lighter curved terminal.
    static func matchingTStem(height: Double, filledInterior: Bool = false) -> Path {
        let dy = height - 42.9439
        func point(_ x: Double, _ y: Double) -> CGPoint { CGPoint(x: x, y: y + dy) }
        func innerPoint(_ x: Double, _ y: Double) -> CGPoint {
            let radiusScale = (17.2756 - curvedYStemWidth) / (17.2756 - 11.5783)
            return CGPoint(x: 17.2756 + (x - 17.2756) * radiusScale,
                y: height - (42.9439 - y) * curvedYTerminalWeight / (42.9439 - 30.6304))
        }
        var p = Path()
        p.move(to: filledInterior ? CGPoint(x: 17.2756, y: 0) : innerPoint(17.2756, 30.6304))
        p.addLine(to: point(17.2756, 42.9439))
        p.addCurve(to: point(14.09, 42.9439), control1: point(17.2756, 42.9439), control2: point(15.3276, 43.0701))
        p.addCurve(to: point(9.5567, 41.7799), control1: point(12.2717, 42.7584), control2: point(11.2556, 42.4541))
        p.addCurve(to: point(6.24861, 40.0646), control1: point(8.20408, 41.2432), control2: point(7.42508, 40.9211))
        p.addCurve(to: point(3.12431, 36.7565), control1: point(4.81202, 39.0187), control2: point(4.1706, 38.1928))
        p.addCurve(to: point(1.16396, 33.3259), control1: point(2.21576, 35.5093), control2: point(1.75346, 34.7519))
        p.addCurve(to: point(0, 28.1187), control1: point(0.367903, 31.4003), control2: point(0, 28.1187))
        p.addLine(to: .zero)
        if filledInterior { p.closeSubpath(); return p }
        p.addLine(to: CGPoint(x: curvedYStemWidth, y: 0))
        p.addLine(to: innerPoint(11.5783, 24.1981))
        p.addCurve(to: innerPoint(12.0071, 28.1187), control1: innerPoint(11.5783, 24.1981), control2: innerPoint(11.5783, 27.0773))
        p.addCurve(to: innerPoint(14.09, 30.1404), control1: innerPoint(12.436, 29.1602), control2: innerPoint(13.0836, 29.6187))
        p.addCurve(to: innerPoint(17.2756, 30.6304), control1: innerPoint(15.2075, 30.7196), control2: innerPoint(17.2756, 30.6304))
        p.closeSubpath()
        return p
    }

    // Use the exact lower half of o/d/a's counter, aligned to the same center
    // and bottom. The open upper sides distinguish the y from a closed counter.
    static let curvedYCounter: Path = {
        let dx = curvedYWidth / 2 - 133.858
        let dy = -297.51
        func point(_ x: Double, _ y: Double) -> CGPoint { CGPoint(x: x + dx, y: y + dy) }
        var p = Path()
        p.move(to: point(127.698, 296.51))
        p.addLine(to: point(140.018, 296.51))
        p.addLine(to: point(140.018, 311.755))
        p.addCurve(to: point(133.858, 318.025),
            control1: point(140.018, 315.275), control2: point(137.433, 318.025))
        p.addCurve(to: point(127.698, 311.755),
            control1: point(130.283, 318.025), control2: point(127.698, 315.275))
        p.closeSubpath()
        return p
    }()

    static let curvedYParts: [Path] = {
        let mirror = CGAffineTransform(a: -1, b: 0, c: 0, d: 1, tx: curvedYWidth, ty: 0)
        let bowlArm = matchingTStem(height: curvedYBodyHeight, filledInterior: true)
        let bowl = bowlArm.union(bowlArm.applying(mirror)).subtracting(curvedYCounter)
        return [bowl, matchingTStem(height: curvedYHeight).applying(mirror)]
    }()
    static let curvedY = curvedYParts.dropFirst().reduce(curvedYParts[0]) {
        $0.union($1)
    }.applying(curvedYTransform)

    static let curvedYGlyphs: [Path] = {
        var result = glyphs
        result[4] = curvedY
        result[5] = glyphs[5].applying(CGAffineTransform(translationX: curvedYPeriodShift, y: 0))
        return result
    }()

    static let curvedYRevealParts: [Path] = [
        curvedYParts[0].applying(curvedYTransform),
        curvedYParts[1].applying(curvedYTransform)
    ]

    static let curvedYBowlTrace: Path = {
        var p = Path()
        p.move(to: CGPoint(x: 5.115, y: -7.5))
        p.addLine(to: CGPoint(x: 5.115, y: 13.5))
        p.addCurve(to: CGPoint(x: 16.39, y: 24.5025),
            control1: CGPoint(x: 5.115, y: 22.3), control2: CGPoint(x: 10.5, y: 24.5025))
        p.addCurve(to: CGPoint(x: 27.665, y: 13.5),
            control1: CGPoint(x: 22.28, y: 24.5025), control2: CGPoint(x: 27.665, y: 22.3))
        return p.applying(curvedYTransform)
    }()
    static let curvedYTailTrace: Path = {
        // The t's own reveal curve, mirrored, flows directly into the bottom curl.
        var p = Path()
        p.move(to: CGPoint(x: 27.665, y: -7.5))
        p.addLine(to: CGPoint(x: 27.665, y: 27.5))
        p.addCurve(to: CGPoint(x: 13.78, y: 38.1439),
            control1: CGPoint(x: 27.665, y: 35.4), control2: CGPoint(x: 22.78, y: 38.1439))
        return p.applying(curvedYTransform)
    }()
    static let curvedYStrokes = [
        Stroke(path: curvedYBowlTrace, width: 13),
        Stroke(path: curvedYTailTrace, width: 13)
    ]

    // The remaining glyphs are unchanged from the supplied animation file.
    // Test The Future Black, with the original spacing and transparent counters.
    static let glyphs: [Path] = [
        roundedT,
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
