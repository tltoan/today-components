import SwiftUI
import PhotosUI
#if canImport(UIKit)
import UIKit
#elseif canImport(AppKit)
import AppKit
#endif

/// Picker-only additions. Existing party fallback gradients keep their original indices.
enum TodayFacePalette {
    static let names = ["Lavender", "Rose", "Blue", "Peach", "Sage", "Dusk", "Lilac", "Mist", "Moss", "Clay", "Iris", "Slate"]
    static let hexColors: [[UInt32]] = TodayAvatarPalette.hexColors + [
        [0x70668f, 0x9980ac, 0xae9ba6], [0x536c88, 0x81929b, 0xb0a4ad],
        [0x486e69, 0x6c8777, 0xa29b78], [0x886765, 0xad8877, 0x7e728e],
        [0x4d5c92, 0x8174b0, 0x9b7aab], [0x4b6275, 0x707586, 0x93949b]
    ]
    static func colors(_ index: Int) -> [Color] {
        hexColors[min(names.count - 1, max(0, index))].map { hex in
            Color(red: Double((hex >> 16) & 255) / 255,
                  green: Double((hex >> 8) & 255) / 255, blue: Double(hex & 255) / 255)
        }
    }
}


/// Portrait & color is selected for onboarding and Edit profile.
/// Store this value on confirmation; wink/glance state is never part of identity.
struct TodayFaceSelection: Equatable, Codable {
    var faceStyle = "tilt"
    var gradientIndex = 0
    var safeStyle: PlayfulFaceStyle { PlayfulFaceStyle.allCases.first { $0.rawValue.lowercased() == faceStyle } ?? .tilt }
    var styleName: String { safeStyle.rawValue }
    var safeIndex: Int { min(TodayFacePalette.names.count - 1, max(0, gradientIndex)) }
}

enum TodayFacePickerLayout: String, CaseIterable {
    case portrait, grid, carousel
}

/// Explicit RGB interpolation keeps all three gradient stops fluid when retargeted.
private struct FaceGradientRGB: VectorArithmetic {
    var r: Double
    var g: Double
    var b: Double
    static var zero: Self { Self(r: 0, g: 0, b: 0) }
    static func + (lhs: Self, rhs: Self) -> Self { Self(r: lhs.r + rhs.r, g: lhs.g + rhs.g, b: lhs.b + rhs.b) }
    static func - (lhs: Self, rhs: Self) -> Self { Self(r: lhs.r - rhs.r, g: lhs.g - rhs.g, b: lhs.b - rhs.b) }
    mutating func scale(by rhs: Double) { r *= rhs; g *= rhs; b *= rhs }
    var magnitudeSquared: Double { r * r + g * g + b * b }
    var color: Color { Color(red: r, green: g, blue: b) }
    init(r: Double, g: Double, b: Double) { self.r = r; self.g = g; self.b = b }
    init(hex: UInt32) { r = Double((hex >> 16) & 255) / 255; g = Double((hex >> 8) & 255) / 255; b = Double(hex & 255) / 255 }
}

private struct TodayFaceGradient: View, Animatable {
    typealias Stops = AnimatablePair<FaceGradientRGB, AnimatablePair<FaceGradientRGB, FaceGradientRGB>>
    var animatableData: Stops
    init(index: Int) {
        let colors = TodayFacePalette.hexColors[min(TodayFacePalette.names.count - 1, max(0, index))]
        animatableData = Stops(FaceGradientRGB(hex: colors[0]),
            AnimatablePair(FaceGradientRGB(hex: colors[1]), FaceGradientRGB(hex: colors[2])))
    }
    var body: some View {
        Circle().fill(LinearGradient(colors: [animatableData.first.color,
            animatableData.second.first.color, animatableData.second.second.color],
            startPoint: .topLeading, endPoint: .bottomTrailing))
    }
}

/// The seven supplied faces on Today's existing avatar palettes.
/// Dependencies: PlayfulFaces.swift (unchanged original), TodayPartyAvatars.swift.
/// Use animated: false in small profile/party avatars. iOS 17+ / macOS 14+.
struct TodayFacePortrait: View {
    var selection: TodayFaceSelection
    var animated = false
    var cropped = true
    var reaction: Int = 0
    var animateFaceChanges = false
    var transitionForward = true
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @Environment(\.scenePhase) private var scenePhase
    @State private var visible = false
    @State private var started: TimeInterval?
    @State private var elapsed: TimeInterval = 0
    @State private var reacted: TimeInterval?

    private var clock: TimeInterval {
        elapsed + (started.map { max(0, ProcessInfo.processInfo.systemUptime - $0) } ?? 0)
    }
    var body: some View {
        GeometryReader { geometry in
            let side = min(geometry.size.width, geometry.size.height)
            let drawingSide = cropped ? side * 512 / 396 : side
            ZStack {
                TodayFaceGradient(index: selection.safeIndex)
                    .padding(cropped ? 0 : side * 58 / 512)
                    .animation(reduceMotion ? nil : .timingCurve(0.22, 0.8, 0.24, 1, duration: 0.56), value: selection.safeIndex)
                TimelineView(.animation(minimumInterval: 1 / 60, paused: started == nil)) { _ in
                    ZStack {
                        // Luminance mask keeps only the original features, without its disk/shade.
                        Color(red: 1, green: 249/255, blue: 244/255).mask {
                            PlayfulFaceArtwork(style: selection.safeStyle, time: animated && !reduceMotion ? clock : 0,
                                reactionAge: reduceMotion ? nil : reacted.map { clock - $0 },
                                ink: .white, surface: .clear, shadowOpacity: 0)
                                .luminanceToAlpha()
                        }
                        .id(selection.faceStyle)
                        .transition(!animateFaceChanges || reduceMotion ? .identity : .asymmetric(
                            insertion: .offset(x: transitionForward ? 36 : -36).combined(with: .opacity),
                            removal: .offset(x: transitionForward ? -36 : 36).combined(with: .opacity)))
                    }
                }
                .frame(width: drawingSide, height: drawingSide)
            }
            .frame(width: side, height: side).clipShape(Circle()).opacity(0.74)
        }
        .aspectRatio(1, contentMode: .fit)
        .accessibilityLabel("\(selection.styleName) face")
        .onAppear { visible = true; updateClock() }
        .onDisappear { visible = false; updateClock() }
        .onChange(of: animated) { _, _ in updateClock() }
        .onChange(of: scenePhase) { _, _ in updateClock() }
        .onChange(of: reduceMotion) { _, _ in updateClock() }
        .onChange(of: selection.faceStyle) { _, _ in reacted = nil }
        .onChange(of: reaction) { _, _ in
            if animated && !reduceMotion && (reacted == nil || clock - reacted! >= FacePerformance.duration) { reacted = clock }
        }
    }
    private func updateClock() {
        let now = ProcessInfo.processInfo.systemUptime
        if visible && animated && scenePhase == .active && !reduceMotion {
            if started == nil { started = now }
        } else if let start = started {
            elapsed += max(0, now - start); started = nil
        }
    }
}

/// Layout-only picker. The host supplies identity text, confirmation and navigation.
/// Portrait arrows cycle all seven supplied faces; swatches independently select a gradient.
struct TodayFacePicker: View {
    @Binding var selection: TodayFaceSelection
    /// Local selection only. Host owns confirmation, persistence and upload.
    @Binding var photoData: Data?
    var layout: TodayFacePickerLayout = .portrait
    var displayName = "You"
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var reaction = 0
    @State private var centered: Int? = 0
    @State private var photoItem: PhotosPickerItem?
    @State private var photoError: String?
    @State private var forward = true
    static let names = TodayFacePalette.names
    private let rim = Color(red: 0.74, green: 0.66, blue: 0.85)
    private var index: Int { selection.safeIndex }

    var body: some View {
        Group {
            switch layout {
            case .portrait: portrait
            case .grid: grid
            case .carousel: carousel
            }
        }
        .foregroundStyle(Color(red: 238/255, green: 234/255, blue: 243/255))
        .sensoryFeedback(.selection, trigger: selection)
        .task(id: photoItem) {
            guard let photoItem else { return }
            do {
                guard let data = try await photoItem.loadTransferable(type: Data.self),
                      data.count <= 10 * 1024 * 1024, Self.photo(data) != nil else {
                    if !Task.isCancelled { photoError = "Choose an image smaller than 10 MB." }
                    return
                }
                guard !Task.isCancelled else { return }
                photoData = data; photoError = nil
            } catch {
                if !Task.isCancelled { photoError = "This image could not be opened. Try another photo." }
            }
        }
        .onAppear { centered = index }
        .onChange(of: selection) { _, _ in
            if centered != index { centered = index }
        }
    }

    private func choose(_ value: Int) {
        let next = min(Self.names.count - 1, max(0, value))
        photoItem = nil; photoError = nil
        withAnimation(reduceMotion ? nil : .timingCurve(0.22, 0.8, 0.24, 1, duration: 0.48)) {
            photoData = nil
            selection.gradientIndex = next
            centered = next
        }
    }
    private func chooseFace(forward direction: Bool) {
        guard photoData == nil else { return }
        forward = direction
        withAnimation(reduceMotion ? nil : .timingCurve(0.22, 0.8, 0.24, 1, duration: 0.48)) {
            let styles = PlayfulFaceStyle.allCases
            let current = styles.firstIndex(of: selection.safeStyle) ?? 1
            selection.faceStyle = styles[(current + (direction ? 1 : -1) + styles.count) % styles.count].rawValue.lowercased()
        }
    }
    private func portrait(_ value: Int, size: CGFloat, animated: Bool = false) -> some View {
        TodayFacePortrait(selection: TodayFaceSelection(faceStyle: selection.faceStyle, gradientIndex: value), animated: animated, reaction: reaction)
            .frame(width: size, height: size).accessibilityHidden(true)
    }
    private func selected(_ value: Int) -> some View {
        RoundedRectangle(cornerRadius: 22)
            .fill(index == value ? rim.opacity(0.1) : Color.white.opacity(0.015))
            .overlay(RoundedRectangle(cornerRadius: 22).strokeBorder(index == value ? rim : .white.opacity(0.06)))
    }
    private static func photo(_ data: Data) -> Image? {
        #if canImport(UIKit)
        return UIImage(data: data).map { Image(uiImage: $0) }
        #elseif canImport(AppKit)
        return NSImage(data: data).map { Image(nsImage: $0) }
        #else
        return nil
        #endif
    }
    private var portrait: some View {
        VStack(spacing: 18) {
            HStack(spacing: 0) {
                Button { chooseFace(forward: false) } label: {
                    Image(systemName: "chevron.left").frame(width: 44, height: 44)
                }.disabled(photoData != nil).accessibilityLabel("Previous face")
                    .frame(maxWidth: .infinity)
                ZStack {
                    if let data = photoData, let image = Self.photo(data) {
                        image.resizable().scaledToFill().frame(width: 198, height: 198)
                            .clipShape(Circle()).accessibilityLabel("Your selected profile photo")
                    } else {
                        Button { reaction += 1 } label: {
                            TodayFacePortrait(selection: selection, animated: true, reaction: reaction,
                                animateFaceChanges: true, transitionForward: forward)
                                .frame(width: 198, height: 198)
                        }.buttonStyle(.plain).accessibilityLabel("\(selection.styleName) face, tap to react")

                    }
                }.frame(width: 198, height: 236)
                    .simultaneousGesture(DragGesture(minimumDistance: 32).onEnded { value in
                        if abs(value.translation.width) > abs(value.translation.height) {
                            chooseFace(forward: value.translation.width < 0)
                        }
                    })
                Button { chooseFace(forward: true) } label: {
                    Image(systemName: "chevron.right").frame(width: 44, height: 44)
                }.disabled(photoData != nil).accessibilityLabel("Next face")
                    .frame(maxWidth: .infinity)
            }.buttonStyle(.plain).clipped()
            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 6), count: 6), spacing: 6) {
                ForEach(0..<Self.names.count, id: \.self) { i in
                    Button { choose(i) } label: {
                        Circle().fill(LinearGradient(colors: TodayFacePalette.colors(i),
                            startPoint: .topLeading, endPoint: .bottomTrailing)).opacity(0.74)
                            .padding(6).frame(minWidth: 44, minHeight: 44)
                            .overlay(Circle().strokeBorder(photoData == nil && index == i ? rim : .clear))
                    }.buttonStyle(.plain).accessibilityLabel("\(Self.names[i]) gradient")
                        .accessibilityAddTraits(photoData == nil && index == i ? [.isSelected] : [])
                }
            }
            HStack(spacing: 16) {
                PhotosPicker(selection: $photoItem, matching: .images) {
                    Label(photoData == nil ? "Upload a photo" : "Change photo", systemImage: "camera")
                        .font(.system(size: 14)).padding(.horizontal, 16).frame(minHeight: 44)
                        .background(.white.opacity(0.025), in: Capsule())
                        .overlay(Capsule().strokeBorder(.white.opacity(0.1)))
                }.buttonStyle(.plain)
                if photoData != nil {
                    Button("Use avatar") { photoItem = nil; photoData = nil; photoError = nil }
                        .font(.system(size: 14)).frame(minHeight: 44).buttonStyle(.plain)
                }
            }
            if let photoError { Text(photoError).font(.footnote).foregroundStyle(.secondary) }
        }
    }
    private var grid: some View {
        VStack(spacing: 28) {
            HStack(spacing: 18) {
                portrait(index, size: 64, animated: true)
                VStack(alignment: .leading, spacing: 4) {
                    Text(displayName).font(.system(size: 21, weight: .medium))
                    Text(Self.names[index]).font(.system(size: 15)).foregroundStyle(.secondary)
                }
                Spacer(minLength: 0)
            }.padding(22).background(.white.opacity(0.035), in: RoundedRectangle(cornerRadius: 24))
            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 12), count: 3), spacing: 14) {
                ForEach(0..<Self.names.count, id: \.self) { i in
                    Button { choose(i) } label: {
                        VStack(spacing: 12) {
                            TodayFacePortrait(selection: TodayFaceSelection(faceStyle: selection.faceStyle, gradientIndex: i))
                                .frame(maxWidth: 80).accessibilityHidden(true)
                            Text(Self.names[i]).font(.system(size: 12))
                        }.frame(maxWidth: .infinity).padding(12).background(selected(i))
                    }.buttonStyle(.plain).accessibilityLabel("\(Self.names[i]) gradient")
                        .accessibilityAddTraits(index == i ? [.isSelected] : [])
                }
            }
        }
    }
    private var carousel: some View {
        VStack(spacing: 24) {
            GeometryReader { geometry in
                ScrollView(.horizontal) {
                    HStack(spacing: 12) {
                        ForEach(0..<Self.names.count, id: \.self) { i in
                            Button { choose(i) } label: {
                                portrait(i, size: 224, animated: index == i)
                            }.buttonStyle(.plain).id(i)
                                .accessibilityLabel("\(Self.names[i]) gradient")
                                .accessibilityAddTraits(index == i ? [.isSelected] : [])
                                .scrollTransition(.interactive, axis: .horizontal) { [reduceMotion] view, phase in
                                    view.scaleEffect(reduceMotion || phase.isIdentity ? 1 : 0.82)
                                        .opacity(phase.isIdentity ? 1 : 0.4)
                                }
                        }
                    }.scrollTargetLayout()
                }
                .contentMargins(.horizontal, max(0, (geometry.size.width - 224) / 2), for: .scrollContent)
                .scrollIndicators(.hidden).scrollTargetBehavior(.viewAligned)
                .scrollPosition(id: $centered)
                .onChange(of: centered) { _, new in
                    if let new, new != index { selection.gradientIndex = new }
                }
            }.frame(height: 224)
            HStack(spacing: 24) {
                Button { choose(index - 1) } label: { Image(systemName: "chevron.left").frame(width: 44, height: 44) }
                    .disabled(index == 0).accessibilityLabel("Previous profile picture")
                Text(Self.names[index]).font(.system(size: 15)).frame(minWidth: 90)
                Button { choose(index + 1) } label: { Image(systemName: "chevron.right").frame(width: 44, height: 44) }
                    .disabled(index == Self.names.count - 1).accessibilityLabel("Next profile picture")
            }.buttonStyle(.plain)
        }
    }
}
