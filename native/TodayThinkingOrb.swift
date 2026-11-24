import SwiftUI
import ThinkingOrbs

/// Today binding for all nine original ThinkingOrbs designs, at both tuned sizes.
/// Add native/vendor/ThinkingOrbs as a local Swift package (or use the pinned
/// upstream package in THINKING-ORBS.md). The original engine stays unchanged.
/// Mount only while work is pending. This view never starts a task or reports progress.
public struct TodayThinkingOrb: View {
    public var design: OrbDesign
    public var size: OrbSize
    public var diameter: CGFloat?
    public var isAnimating: Bool
    public var label: String
    @Environment(\.scenePhase) private var scenePhase

    public init(_ design: OrbDesign = .working, size: OrbSize = .regular,
                diameter: CGFloat? = nil, isAnimating: Bool = true, label: String = "Preparing your plan") {
        self.design = design
        self.size = size
        self.diameter = diameter
        self.isAnimating = isAnimating
        self.label = label
    }

    public var body: some View {
        ThinkingOrb(design, size: size, diameter: diameter,
                    isPaused: !isAnimating || scenePhase != .active)
            .environment(\.colorScheme, .dark)
            .accessibilityLabel(Text(label))
    }
}

/// Standalone component specimen, not an implemented app screen.
public struct TodayThinkingOrbGallery: View {
    public init() {}
    public var body: some View {
        ScrollView {
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 180))], spacing: 20) {
                ForEach(OrbDesign.allCases) { design in
                    VStack(alignment: .leading, spacing: 24) {
                        Text(design.title).font(.custom("TestTheFuture-Medium", size: 18))
                        HStack(spacing: 28) {
                            TodayThinkingOrb(design, label: design.title)
                            TodayThinkingOrb(design, size: .small, label: design.title + ", small")
                        }.frame(maxWidth: .infinity, minHeight: 100)
                    }
                    .padding(24)
                    .background(Color(red: 13/255, green: 12/255, blue: 18/255), in: RoundedRectangle(cornerRadius: 28))
                }
            }.padding(24)
        }.background(.black).foregroundStyle(Color(red: 238/255, green: 234/255, blue: 243/255))
    }
}
