import SwiftUI
import WonderLab

/// iPad / iPhone entry point. All screens are the shared Compose Multiplatform UI (the same code as the Android app).
@main
struct WonderLabIOSApp: App {
    @Environment(\.scenePhase) private var phase

    var body: some Scene {
        WindowGroup {
            ComposeView()
                .ignoresSafeArea()
                // emailed links (reset password / verify email) opened with the app
                .onOpenURL { url in MainViewControllerKt.handleOpenUrl(url: url.absoluteString) }
        }
        .onChange(of: phase) { p in
            if p == .background { MainViewControllerKt.onAppBackground() }
        }
    }
}

struct ComposeView: UIViewControllerRepresentable {
    func makeUIViewController(context: Context) -> UIViewController { MainViewControllerKt.MainViewController() }
    func updateUIViewController(_ controller: UIViewController, context: Context) {}
}
