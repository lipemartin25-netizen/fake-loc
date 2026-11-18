# Android

Aplicativo Kotlin/Compose com identificador novo `br.com.fakeloc.app`, minSdk 26, compile/target SDK 35 e Gradle 8.9 via Wrapper. JDK 17 ou posterior é suportado. A localização mock oficial ainda não está conectada.

Para compilar: instale JDK 17+ e Android SDK 35, aceite as licenças e rode `./gradlew :app:assembleDebug :app:testDebugUnitTest`. O SDK precisa incluir `platforms;android-35` e `build-tools;35.0.0`.
