import SwiftUI

/// Full-screen motion proposal for Figma 121:11927.
/// Add alongside TodayIntro.swift. Uses Today's existing TestTheFuture-Medium font.
struct TodayWelcomeIntro: View {
    var isPlaying = true
    var speed: Double = 1
    var replayToken = 0
    var onBegin: () -> Void

    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @Environment(\.scenePhase) private var scenePhase
    @State private var start: Date?
    @State private var elapsed: Double = 0
    @State private var visible = false

    private var rate: Double { min(2, max(0.1, speed)) }

    var body: some View {
        TimelineView(.animation(minimumInterval: 1 / 60, paused: start == nil)) { timeline in
            let seconds = elapsed + (start.map { max(0, timeline.date.timeIntervalSince($0)) * rate } ?? 0)
            TodayWelcomeArtwork(time: reduceMotion ? TodayIntroArtwork.duration : seconds, onBegin: onBegin)
                .onChange(of: seconds >= TodayIntroArtwork.duration) { _, done in
                    if done { elapsed = TodayIntroArtwork.duration; start = nil }
                }
        }
        .onAppear { visible = true; updateClock() }
        .onDisappear { visible = false; updateClock() }
        .onChange(of: isPlaying) { _, _ in updateClock() }
        .onChange(of: scenePhase) { _, _ in updateClock() }
        .onChange(of: reduceMotion) { _, _ in updateClock() }
        .onChange(of: replayToken) { _, _ in elapsed = 0; start = nil; updateClock() }
        .onChange(of: speed) { oldSpeed, _ in
            if let start {
                elapsed += max(0, Date.now.timeIntervalSince(start)) * min(2, max(0.1, oldSpeed))
                self.start = .now
            }
        }
    }

    private func updateClock() {
        if visible && isPlaying && !reduceMotion && scenePhase == .active && elapsed < TodayIntroArtwork.duration {
            if start == nil { start = .now }
        } else if let start {
            elapsed += max(0, Date.now.timeIntervalSince(start)) * rate
            self.start = nil
        }
    }
}

/// The approved intro remains untouched through its 2.017-second settle.
/// Then the logo moves into the full screen's smaller typography role.
struct TodayWelcomeArtwork: View {
    var time: Double
    var onBegin: () -> Void = {}

    var body: some View {
        GeometryReader { geometry in
            let fit = min(geometry.size.width / 390, geometry.size.height / 844)
            let handoff = TodayWelcomeMotion.progress(time, start: 2.06, duration: 0.52)
            let tagline = TodayWelcomeMotion.progress(time, start: 2.30, duration: 0.46)
            let actions = TodayWelcomeMotion.progress(time, start: 2.62, duration: 0.48)
            let finalScale = 35.0 / 55.0
            let scale = 1 + (finalScale - 1) * handoff
            let shift = CGSize(width: (127 - 88 * finalScale) * handoff,
                               height: (299 - 326 * finalScale) * handoff)

            ZStack {
                TodayIntroArtwork(time: time, wordmarkScale: scale,
                                  wordmarkTranslation: shift,
                                  wordmarkInk: TodayWelcomeMotion.ink(handoff))
                    .accessibilityHidden(true)

                VStack(spacing: 0) {
                    Spacer().frame(height: 323)
                    Text("what will you do?")
                        .font(.custom("TestTheFuture-Medium", fixedSize: 15))
                        .foregroundStyle(TodayWelcomeMotion.secondary)
                        .multilineTextAlignment(.center)
                        .frame(width: 135, height: 42, alignment: .top)
                        .offset(x: -0.5, y: 7 * (1 - tagline))
                        .opacity(tagline)
                        .accessibilityLabel("Today. What will you do?")
                        .accessibilityHidden(tagline < 0.5)
                    Spacer(minLength: 0)
                    VStack(spacing: 9) {
                        TodayWelcomeBeginButton(action: onBegin)
                            .frame(width: 265, height: 65)
                            .offset(x: -0.5)
                        Text("By tapping Begin, you agree to our\nPrivacy and Terms of Service")
                            .font(.custom("TestTheFuture-Medium", fixedSize: 15))
                            .foregroundStyle(TodayWelcomeMotion.secondary)
                            .multilineTextAlignment(.center)
                            .frame(width: 264, height: 42, alignment: .top)
                    }
                    .offset(y: 10 * (1 - actions))
                    .opacity(actions)
                    .allowsHitTesting(actions > 0.1)
                    .accessibilityHidden(actions < 0.5)
                    .padding(.bottom, 34)
                }
                .frame(width: 390, height: 844)
                .scaleEffect(fit)
                .frame(width: geometry.size.width, height: geometry.size.height)
            }
        }
        .clipped()
        .preferredColorScheme(.dark)
    }
}

private enum TodayWelcomeMotion {
    static let secondary = Color(red: 0.73, green: 0.73, blue: 0.77)

    static func progress(_ time: Double, start: Double, duration: Double) -> Double {
        let x = min(1, max(0, (time - start) / duration))
        return x * x * x * (x * (x * 6 - 15) + 10)
    }

    static func ink(_ progress: Double) -> GraphicsContext.Shading {
        // Figma's 35 pt text frame has different gradient coordinates from the
        // 55 pt intro. Interpolate in the original wordmark's local space.
        func mix(_ a: Double, _ b: Double) -> Double { a + (b - a) * progress }
        return .linearGradient(Gradient(stops: [
            .init(color: Color(white: 0.8396183848), location: 0),
            .init(color: Color(white: 0.5191368461), location: 1)
        ]), startPoint: CGPoint(x: mix(98.9926, 99), y: mix(291.54, 299.2857142857)),
            endPoint: CGPoint(x: mix(273.291, 278.9285714286), y: mix(341.08, 338.5714285714)))
    }
}

/// Uses the existing Today prominent button's 65 pt height / 29 pt radius,
/// with the precise paint and label color from the supplied welcome instance.
private struct TodayWelcomeBeginButton: View {
    var action: () -> Void

    var body: some View {
        Button(action: action) {
            Text("Begin")
                .font(.custom("TestTheFuture-Medium", fixedSize: 20))
                .foregroundStyle(Color(white: 0.5945011973))
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background {
                    LinearGradient(stops: [
                        .init(color: Color(white: 0.1831430346), location: 0),
                        .init(color: Color(white: 0.3416841924), location: 0.21634616),
                        .init(color: Color(white: 0.3130258322), location: 0.79807693),
                        .init(color: Color(white: 0.1665039063), location: 1)
                    ], startPoint: UnitPoint(x: 7 / 265.0, y: 39.591 / 65),
                       endPoint: UnitPoint(x: 265.033 / 265, y: 34.936 / 65))
                    .clipShape(RoundedRectangle(cornerRadius: 29))
                }
                .contentShape(RoundedRectangle(cornerRadius: 29))
        }
        .buttonStyle(TodayWelcomePressStyle())
        .accessibilityIdentifier("begin")
    }
}

private struct TodayWelcomePressStyle: ButtonStyle {
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed && !reduceMotion ? 0.96 : 1)
            .animation(.easeOut(duration: 0.16), value: configuration.isPressed)
    }
}

/// Standalone review only: Begin replays the entrance. Supply your onboarding
/// action to TodayWelcomeIntro(onBegin:) in the app.
struct TodayWelcomePreview: View {
    @State private var replay = 0
    var body: some View {
        TodayWelcomeIntro(replayToken: replay, onBegin: { replay += 1 })
            .ignoresSafeArea()
    }
}
