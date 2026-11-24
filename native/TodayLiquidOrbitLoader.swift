import SwiftUI

enum TodayLiquidOrbitPalette {
    case original, soft
    var colors: [Color] {
        switch self {
        case .original: [Color(red: 94/255, green: 145/255, blue: 246/255),
                         Color(red: 167/255, green: 129/255, blue: 240/255),
                         Color(red: 1, green: 178/255, blue: 118/255)]
        case .soft: [Color(red: 169/255, green: 181/255, blue: 211/255),
                     Color(red: 191/255, green: 178/255, blue: 210/255),
                     Color(red: 221/255, green: 199/255, blue: 189/255)]
        }
    }
}

/// Approved loader, using the supplied LiquidOrbitLoader motion unchanged.
/// Include native/reference/LiquidOrbitLoader.swift. iOS 17+ / macOS 14+.
/// Mount while work is pending; the host owns completion. No assets required.
struct TodayLiquidOrbitLoader: View {
    var isAnimating = true
    var speed: Double = 1
    var replayToken = 0
    var label = "Loading"
    var palette: TodayLiquidOrbitPalette = .original

    var body: some View {
        LinearGradient(
            colors: palette.colors,
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
