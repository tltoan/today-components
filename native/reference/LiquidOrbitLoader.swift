import SwiftUI

/// Eight liquid beads moving around a tilted orbit, recreated from the supplied reference.
/// iOS 17+ / macOS 14+. Native drawing; no images, videos, or packages required.
///
///     LiquidOrbitLoader()
///         .frame(width: 180, height: 170)
///
/// The background is transparent. Pause with isAnimating, change speed, or change
/// replayToken to restart. Reduce Motion displays a still representative pose.
struct LiquidOrbitLoader: View {
    var isAnimating = true
    var speed: Double = 1
    var replayToken = 0
    var color: Color = .black

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
        TimelineView(.animation(minimumInterval: 1 / 60, paused: started == nil)) { _ in
            let now = ProcessInfo.processInfo.systemUptime
            let seconds = elapsed + (started.map { max(0, now - $0) * rate } ?? 0)
            LiquidOrbitArtwork(time: reduceMotion ? 0 : seconds, color: color)
        }
        .aspectRatio(740 / 700, contentMode: .fit)
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

/// Deterministic artwork, also useful for scrubbing or exporting frames.
struct LiquidOrbitArtwork: View {
    static let cycleDuration: Double = 1
    static let background = Color(red: 242 / 255, green: 243 / 255, blue: 240 / 255)

    var time: Double = 0
    var color: Color = .black

    var body: some View {
        Canvas { context, size in
            let scale = min(size.width / 740, size.height / 700)
            guard scale > 0 else { return }
            let seconds = time.isFinite ? max(0, time) : 0
            let phase = seconds.truncatingRemainder(dividingBy: Self.cycleDuration)
                / Self.cycleDuration
            let beads = LiquidOrbitMotion.beads(at: phase)
            let normalization = beads.map(\.sharpness).max() ?? 1

            context.translateBy(x: (size.width - 740 * scale) / 2,
                                y: (size.height - 700 * scale) / 2)
            context.scaleBy(x: scale, y: scale)

            // Sum soft elliptical fields, then take one contour of that sum.
            // The connections belong to the beads themselves; no bridge paths
            // appear or disappear separately from the moving shapes.
            context.addFilter(.alphaThreshold(min: exp(-normalization), color: color))
            context.drawLayer { field in
                field.blendMode = .plusLighter
                for bead in beads {
                    var local = field
                    let extent = sqrt(12 / bead.sharpness)
                    local.translateBy(x: bead.center.x, y: bead.center.y)
                    local.rotate(by: .radians(bead.angle))
                    local.scaleBy(x: bead.tangentRadius * extent,
                                  y: bead.normalRadius * extent)
                    let stops: [Gradient.Stop] = (0...96).map { index in
                        let u = Double(index) / 96
                        let alpha = exp(bead.sharpness - normalization - 12 * u * u)
                        return .init(color: .white.opacity(alpha), location: u)
                    }
                    local.fill(
                        Path(ellipseIn: CGRect(x: -1, y: -1, width: 2, height: 2)),
                        with: .radialGradient(Gradient(stops: stops), center: .zero,
                                              startRadius: 0, endRadius: 1)
                    )
                }
            }
        }
        .accessibilityHidden(true)
    }
}

private enum LiquidOrbitMotion {
    struct Bead {
        let center: CGPoint
        let tangentRadius: Double
        let normalRadius: Double
        let angle: Double
        let sharpness: Double
    }

    static func beads(at phase: Double) -> [Bead] {
        (0..<8).map { index in
            let angle = (Double(index) + phase) * .pi / 4
            var basis = [1.0]
            var derivative = [0.0]
            for harmonic in 1...6 {
                let n = Double(harmonic)
                basis.append(contentsOf: [cos(n * angle), sin(n * angle)])
                derivative.append(contentsOf: [-n * sin(n * angle), n * cos(n * angle)])
            }
            func sample(_ coefficients: [Double]) -> Double {
                zip(basis, coefficients).reduce(0) { $0 + $1.0 * $1.1 }
            }
            let dx = zip(derivative, orbitX).reduce(0) { $0 + $1.0 * $1.1 }
            let dy = zip(derivative, orbitY).reduce(0) { $0 + $1.0 * $1.1 }
            return Bead(
                center: CGPoint(x: sample(orbitX) + sample(correctionX),
                                y: sample(orbitY) + sample(correctionY)),
                tangentRadius: exp(sample(tangentRadius)),
                normalRadius: exp(sample(normalRadius)),
                angle: atan2(dy, dx) + sample(tilt),
                sharpness: exp(sample(sharpness))
            )
        }
    }

    // Periodic profiles fitted to the reference's orbit and changing silhouettes.
    // Every bead follows the same smooth profile. At one second each occupies
    // its neighbor's starting pose, making both position and velocity seamless.
    private static let orbitX: [Double] = [
        383.3125000000, -59.7709304784, -225.0608664390, 5.5545051348, -6.6779212152, -1.7263490689, 3.4559275566, 0.0000000000, 0.0000000000, 0.0000000000, 0.0000000000, 0.0000000000, 0.0000000000
    ]
    private static let orbitY: [Double] = [
        364.7750000000, -156.0112968862, 161.7418246178, -0.2758305468, 0.9919234271, 7.6909011393, 2.0845426119, 0.0000000000, 0.0000000000, 0.0000000000, 0.0000000000, 0.0000000000, 0.0000000000
    ]
    private static let tangentRadius: [Double] = [
        4.2643261155, 0.0394692854, -0.0046005836, 0.1657249805, 0.0798650006, -0.0117867885, 0.0199325748, -0.0266501115, 0.0545557843, 0.0005428582, 0.0340653565, 0.0056299026, 0.0211998451
    ]
    private static let normalRadius: [Double] = [
        4.1415264110, -0.0552365479, 0.2099438557, 0.1835505403, 0.1147053340, 0.0988909030, 0.0158245645, -0.0238415266, 0.0247273605, -0.0076828711, 0.0035540835, 0.0305938742, 0.0271482540
    ]
    private static let tilt: [Double] = [
        0.3845377411, 0.1658815198, 0.4150606999, 0.2062102106, -0.8092036111, 0.1902159178, -0.2407438842, -0.1316217644, 0.0833317326, 0.0086752046, -0.1439234898, 0.0208064108, -0.0713018738
    ]
    private static let sharpness: [Double] = [
        0.0062601850, -0.2667198306, 0.1370302818, -0.2588094036, 0.1209872049, -0.0693886145, 0.0464174222, 0.3192780488, -0.5342568104, -0.2371642296, 0.1578001188, 0.2344876898, 0.2365120258
    ]
    private static let correctionX: [Double] = [
        1.1575751319, 0.9389006941, -3.9171573830, -1.1744308884, -2.5462185873, 0.3861021420, 0.7324845442, 0.8916131924, 2.4089328087, 1.6308752580, -1.5603599428, -0.9324790655, -1.4583650492
    ]
    private static let correctionY: [Double] = [
        1.5616303621, -1.1488806131, -0.0402415973, -2.0706111229, 0.5597335948, -1.3429775027, 1.3152170562, -1.3908970635, -0.0832819828, -0.2633539435, 0.2362862190, 0.7261797595, 0.2295573639
    ]
}

/// Optional standalone review screen; the reusable component has no controls.
struct LiquidOrbitPreview: View {
    @State private var playing = true
    @State private var slow = false
    @State private var replay = 0

    var body: some View {
        VStack(spacing: 48) {
            LiquidOrbitLoader(isAnimating: playing, speed: slow ? 0.5 : 1,
                              replayToken: replay)
                .frame(width: 280, height: 265)
            HStack(spacing: 28) {
                Button(playing ? "Pause" : "Play") { playing.toggle() }
                Button("Replay") { replay += 1; playing = true }
                Button(slow ? "1×" : "½×") { slow.toggle() }
            }
            .font(.system(size: 14, weight: .medium))
            .tint(.black.opacity(0.65))
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(LiquidOrbitArtwork.background.ignoresSafeArea())
    }
}

struct LiquidOrbitLoader_Previews: PreviewProvider {
    static var previews: some View { LiquidOrbitPreview() }
}
