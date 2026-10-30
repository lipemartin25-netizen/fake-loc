# Android

Aplicativo Kotlin/Compose com identificador novo `br.com.fakeloc.app`, minSdk 26, compile/target SDK 35 e JDK 17. Neste ambiente não há Java, Android SDK ou Gradle; por isso a compilação não foi executada. Localização mock oficial ainda não está conectada.

Para compilar: instale JDK 17 e Android SDK 35, gere/obtenha o Gradle Wrapper completo e rode `./gradlew :app:assembleDebug :app:testDebugUnitTest`. O wrapper jar não foi fabricado: requer distribuição oficial e rede.
