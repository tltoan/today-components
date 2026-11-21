import SwiftUI

/// Alternative loader proposal, using the supplied LiquidOrbitLoader motion unchanged.
/// Include native/reference/LiquidOrbitLoader.swift. iOS 17+ / macOS 14+.
/// Mount while work is pending; the host owns completion. No assets required.
struct TodayLiquidOrbitLoader: View {
    var isAnimating = true
    var speed: Double = 1
    var replayToken = 0
    var label = "Loading"

    var body: some View {
        LinearGradient(
            colors: [Color(red: 94/255, green: 145/255, blue: 246/255),
                     Color(red: 167/255, green: 129/255, blue: 240/255),
                     Color(red: 1, green: 178/255, blue: 118/255)],
            startPoint: .bottomLeading, endPoint: .topTrailing
        )
        .mask {
            LiquidOrbitLoader(isAnimating: isAnimating, speed: speed,
                              replayToken: replayToken, color: .white)
        }
        .aspectRatio(740.0 / 700.0, contentMode: .fit)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(label)
    }
}
