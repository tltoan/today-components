import SwiftUI

/// Circle → twisting globe → circle, recreated from the supplied motion reference.
/// iOS 17+ / macOS 14+. Native vectors; no assets, fonts, or packages required.
///
///     CoilSphereLoader()
///         .frame(width: 240, height: 240)
///
/// The component is transparent. Use CoilSpherePreview for the olive background
/// and review controls. Change replayToken to restart, or isAnimating to pause.
struct CoilSphereLoader: View {
    var isAnimating = true
    var speed: Double = 1
    var replayToken = 0
    var color = Color(red: 1, green: 0.61, blue: 0.13)
    /// Stroke thickness at a 240-point component size.
    var lineWidth: CGFloat = 2.3

    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @Environment(\.scenePhase) private var scenePhase
    @State private var started: TimeInterval?
    @State private var elapsed: TimeInterval = 0
    @State private var visible = false

    private var rate: Double { Self.validRate(speed) }
    private static func validRate(_ value: Double) -> Double {
        value.isFinite ? min(4, max(0.1, value)) : 1
    }

    var body: some View {
        TimelineView(.animation(paused: started == nil)) { _ in
            let now = ProcessInfo.processInfo.systemUptime
            let seconds = elapsed + (started.map { max(0, now - $0) * rate } ?? 0)
            CoilSphereArtwork(time: reduceMotion ? 2.0 : seconds,
                              color: color, lineWidth: lineWidth)
        }
        .aspectRatio(1, contentMode: .fit)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Loading")
        .onAppear { visible = true; updateClock() }
        .onDisappear { visible = false; updateClock() }
        .onChange(of: isAnimating) { _, _ in updateClock() }
        .onChange(of: scenePhase) { _, _ in updateClock() }
        .onChange(of: reduceMotion) { _, _ in updateClock() }
        .onChange(of: replayToken) { _, _ in elapsed = 0; started = nil; updateClock() }
        .onChange(of: speed) { oldSpeed, _ in
            if let start = started {
                let now = ProcessInfo.processInfo.systemUptime
                elapsed += max(0, now - start) * Self.validRate(oldSpeed)
                started = now
            }
        }
    }

    private func updateClock() {
        let now = ProcessInfo.processInfo.systemUptime
        if visible && isAnimating && !reduceMotion && scenePhase == .active {
            if started == nil { started = now }
        } else if let start = started {
            elapsed += max(0, now - start) * rate
            started = nil
        }
    }
}

/// Deterministic drawing shared by playback, scrubbing, and video export.
struct CoilSphereArtwork: View {
    static let cycleDuration = 4.84
    static let background = Color(red: 43 / 255, green: 55 / 255, blue: 0)

    var time: Double = 0
    var color = Color(red: 1, green: 0.61, blue: 0.13)
    var lineWidth: CGFloat = 2.3

    var body: some View {
        Canvas { context, size in
            let side = min(size.width, size.height)
            guard side > 0 else { return }
            let t = time.isFinite ? max(0, time).truncatingRemainder(dividingBy: Self.cycleDuration) : 0
            let points = CoilSphereMotion.vertices(at: t)
            let width = max(0.1, lineWidth) * side / 240
            let radius = side * 0.435
            context.translateBy(x: size.width / 2, y: size.height / 2)

            func projected(_ index: Int) -> CGPoint {
                CGPoint(x: points[index].x * radius, y: points[index].y * radius)
            }

            var entireCurve = Path()
            entireCurve.move(to: projected(0))
            for index in 1..<points.count { entireCurve.addLine(to: projected(index)) }
            entireCurve.closeSubpath()

            // A very small halo softens the wire without obscuring its crossings.
            context.drawLayer { halo in
                halo.addFilter(.blur(radius: width * 0.5))
                halo.stroke(entireCurve, with: .color(color.opacity(0.18)),
                            style: StrokeStyle(lineWidth: width * 1.5, lineCap: .round, lineJoin: .round))
            }
            context.stroke(entireCurve, with: .color(color.opacity(0.35)),
                           style: StrokeStyle(lineWidth: width, lineCap: .round, lineJoin: .round))

            // Shade short continuous sections by depth. The curve itself twists;
            // there is no flat image rotating or separate ribbon overlay.
            let chunk = 6
            for start in stride(from: 0, to: points.count - 1, by: chunk) {
                let end = min(start + chunk, points.count - 1)
                let depth = points[(start + end) / 2].z
                let front = min(1, max(0, (depth + 1) / 2))
                var section = Path()
                section.move(to: projected(start))
                for index in (start + 1)...end { section.addLine(to: projected(index)) }
                context.stroke(section, with: .color(color.opacity(0.35 + 0.65 * front)),
                               style: StrokeStyle(lineWidth: width / (1 - 0.2 * depth),
                                                  lineCap: .round, lineJoin: .round))
            }
        }
        .accessibilityHidden(true)
    }
}

private enum CoilSphereMotion {
    struct Vertex { let x: Double; let y: Double; let z: Double }

    static func vertices(at t: Double) -> [Vertex] {
        let winding = max(0, tracks[0].value(t))
        let qx = tracks[1].value(t), qy = tracks[2].value(t)
        let qz = tracks[3].value(t), qw = tracks[4].value(t)
        let length = sqrt(qx*qx + qy*qy + qz*qz + qw*qw)
        let x = qx / length, y = qy / length, z = qz / length, w = qw / length
        let m00 = 1 - 2*(y*y + z*z), m01 = 2*(x*y - z*w), m02 = 2*(x*z + y*w)
        let m10 = 2*(x*y + z*w), m11 = 1 - 2*(x*x + z*z), m12 = 2*(y*z - x*w)
        let m20 = 2*(x*z - y*w), m21 = 2*(y*z + x*w), m22 = 1 - 2*(x*x + y*y)

        return circle.map { sample in
            // Twist and the axial turn share one driver. Factoring that turn
            // out of the camera avoids the old independent yaw reversals.
            let azimuth = winding * (sample.y - 4.0 / 3.0)
            let a = sample.x * cos(azimuth), b = sample.y, c = sample.x * sin(azimuth)
            let depth = m20*a + m21*b + m22*c
            let perspective = 1 / (1 - 0.2 * depth)
            return Vertex(x: (m00*a + m01*b + m02*c) * perspective,
                          y: (m10*a + m11*b + m12*c) * perspective, z: depth)
        }
    }

    private static let circle: [Vertex] = (0...1200).map { index in
        let angle = Double(index) / 1200 * 2 * Double.pi
        return Vertex(x: sin(angle), y: cos(angle), z: 0)
    }

    // Fitted from the reference's full 25 fps sequence, then smoothed in
    // quaternion space. The orientation passes through the pole instead of
    // reversing there. Winding peaks once, without a full-sphere hold.
    private struct Key {
        let time: Double
        let values: [Double]
        init(_ time: Double, _ winding: Double, _ x: Double, _ y: Double, _ z: Double, _ w: Double) {
            self.time = time
            values = [winding, x, y, z, w]
        }
    }

    private static let keys: [Key] = [
        .init(0.00000000, 0.00000000, 0.00000000, 0.00000000, 0.65938467, 0.75180573),
        .init(0.12000000, 0.02760655, 0.01119173, 0.03642478, 0.65964645, 0.75060945),
        .init(0.24000000, 0.16015656, 0.02857042, 0.08158286, 0.66505836, 0.74177177),
        .init(0.40000000, 0.61419629, 0.08607167, 0.08858537, 0.65067515, 0.74924372),
        .init(0.56000000, 1.53925241, 0.14382352, 0.10208944, 0.60096994, 0.77956890),
        .init(0.72000000, 3.16842805, 0.20033416, 0.08056937, 0.52095081, 0.82582387),
        .init(0.88000000, 6.10380888, 0.25075745, 0.02389045, 0.41544319, 0.87404628),
        .init(1.04000000, 9.50971087, 0.25787806, -0.04288646, 0.29921377, 0.91767684),
        .init(1.20000000, 11.76249884, 0.21691069, -0.09670605, 0.18888552, 0.95284834),
        .init(1.40000000, 13.22288535, 0.11662464, -0.07828570, 0.07772329, 0.98703046),
        .init(1.60000000, 13.85801208, -0.02322117, -0.06156833, -0.00937058, 0.99778871),
        .init(1.80000000, 14.01890663, -0.18632914, 0.01211328, -0.08189643, 0.97899320),
        .init(2.00000000, 13.87117164, -0.35731859, 0.07285370, -0.13628451, 0.92110927),
        .init(2.20000000, 13.44636406, -0.51885609, 0.17381938, -0.18815088, 0.81558227),
        .init(2.40000000, 12.78687380, -0.67161343, 0.19867187, -0.19733500, 0.68594737),
        .init(2.60000000, 11.87319855, -0.79627275, 0.21043167, -0.22164880, 0.52205367),
        .init(2.80000000, 10.73916777, -0.89274170, 0.18672075, -0.21921042, 0.34654641),
        .init(3.00000000, 9.41106045, -0.95504262, 0.12101171, -0.20463188, 0.17713145),
        .init(3.20000000, 7.92796254, -0.98204571, 0.02991688, -0.18368354, 0.03084738),
        .init(3.40000000, 6.38018772, -0.97472701, -0.08885855, -0.18705518, -0.08379605),
        .init(3.60000000, 4.87085664, -0.94494241, -0.22085521, -0.18100603, -0.15982379),
        .init(3.80000000, 3.49203879, -0.90058673, -0.35244265, -0.16571878, -0.19304145),
        .init(4.00000000, 2.29159921, -0.84927552, -0.47136596, -0.14533614, -0.18820902),
        .init(4.20000000, 1.30635180, -0.80007625, -0.56639289, -0.12552560, -0.15271023),
        .init(4.40000000, 0.57311047, -0.76424507, -0.63104181, -0.09103811, -0.09709668),
        .init(4.60000000, 0.12868913, -0.74433651, -0.66172247, -0.07933563, -0.04233661),
        .init(4.72000000, 0.02500000, -0.74453881, -0.66591503, -0.04241329, -0.02049996),
        .init(4.84000000, 0.00000000, -0.75180573, -0.65938467, 0.00000000, 0.00000000),
    ]

    private static let tracks: [CubicTrack] = (0..<5).map { component in
        CubicTrack(times: keys.map(\.time), values: keys.map { $0.values[component] })
    }

    /// One globally solved spline preserves velocity and acceleration between
    /// poses. Quintic end caps bring both to zero at the loop boundary.
    private struct CubicTrack {
        struct Sample { let value: Double; let velocity: Double; let acceleration: Double }
        let times: [Double]
        let values: [Double]
        let second: [Double]

        init(times: [Double], values: [Double]) {
            self.times = times
            self.values = values
            let count = times.count
            let h = (0..<count - 1).map { times[$0 + 1] - times[$0] }
            let delta = h.indices.map { (values[$0 + 1] - values[$0]) / h[$0] }
            var lower = [Double](repeating: 0, count: count)
            var diagonal = lower, upper = lower, rhs = lower
            diagonal[0] = 2*h[0]; upper[0] = h[0]; rhs[0] = 6*delta[0]
            for i in 1..<count - 1 {
                lower[i] = h[i - 1]
                diagonal[i] = 2*(h[i - 1] + h[i])
                upper[i] = h[i]
                rhs[i] = 6*(delta[i] - delta[i - 1])
            }
            lower[count - 1] = h[count - 2]
            diagonal[count - 1] = 2*h[count - 2]
            rhs[count - 1] = -6*delta[count - 2]
            for i in 1..<count {
                let factor = lower[i] / diagonal[i - 1]
                diagonal[i] -= factor * upper[i - 1]
                rhs[i] -= factor * rhs[i - 1]
            }
            var solved = rhs
            solved[count - 1] /= diagonal[count - 1]
            for i in stride(from: count - 2, through: 0, by: -1) {
                solved[i] = (rhs[i] - upper[i] * solved[i + 1]) / diagonal[i]
            }
            second = solved
        }

        func value(_ time: Double) -> Double {
            let end = times.last!
            guard time > 0 else { return values[0] }
            guard time < end else { return values.last! }
            let cap = 0.12
            if time < cap {
                return endCap(from: values[0], to: sample(cap), u: time / cap, span: cap, direction: 1)
            }
            if time > end - cap {
                return endCap(from: values.last!, to: sample(end - cap),
                              u: (end - time) / cap, span: cap, direction: -1)
            }
            return sample(time).value
        }

        private func endCap(from start: Double, to target: Sample,
                            u: Double, span: Double, direction: Double) -> Double {
            let change = target.value - start
            let velocity = target.velocity * span * direction
            let acceleration = target.acceleration * span * span
            let a = 10*change - 4*velocity + 0.5*acceleration
            let b = -15*change + 7*velocity - acceleration
            let c = 6*change - 3*velocity + 0.5*acceleration
            return start + u*u*u * (a + u * (b + u*c))
        }

        private func sample(_ time: Double) -> Sample {
            let i = (0..<times.count - 1).first { time < times[$0 + 1] } ?? times.count - 2
            let h = times[i + 1] - times[i], u = time - times[i]
            let b = (values[i + 1] - values[i]) / h - h * (2*second[i] + second[i + 1]) / 6
            let c = second[i] / 2, d = (second[i + 1] - second[i]) / (6*h)
            return Sample(value: values[i] + u * (b + u * (c + u*d)),
                          velocity: b + u * (2*c + 3*u*d), acceleration: 2*c + 6*u*d)
        }
    }
}

/// Optional preview controls. The reusable loader contains no controls or labels.
struct CoilSpherePreview: View {
    @State private var playing = true
    @State private var slow = false
    @State private var replay = 0

    var body: some View {
        VStack(spacing: 36) {
            CoilSphereLoader(isAnimating: playing, speed: slow ? 0.5 : 1, replayToken: replay)
                .frame(width: 240, height: 240)
            HStack(spacing: 24) {
                Button(playing ? "Pause" : "Play") { playing.toggle() }
                Button("Replay") { replay += 1; playing = true }
                Button(slow ? "1×" : "½×") { slow.toggle() }
            }
            .font(.system(size: 14, weight: .medium))
            .tint(Color(red: 1, green: 0.61, blue: 0.13))
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(CoilSphereArtwork.background.ignoresSafeArea())
    }
}

struct CoilSphereLoader_Previews: PreviewProvider {
    static var previews: some View { CoilSpherePreview() }
}
