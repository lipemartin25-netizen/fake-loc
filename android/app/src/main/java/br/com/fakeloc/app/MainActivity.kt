package br.com.fakeloc.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.delay

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) { super.onCreate(savedInstanceState); setContent { FakeLocScreen() } }
}

@Composable private fun FakeLocScreen() {
    val home = remember { Coordinate(-23.5505, -46.6333) }
    var latitude by remember { mutableStateOf("-22.9068") }
    var longitude by remember { mutableStateOf("-43.1729") }
    var current by remember { mutableStateOf(home) }
    var destination by remember { mutableStateOf<Coordinate?>(null) }
    var message by remember { mutableStateOf("Defina um destino para iniciar") }
    var running by remember { mutableStateOf(false) }
    var paused by remember { mutableStateOf(false) }
    var activeSeconds by remember { mutableIntStateOf(0) }

    LaunchedEffect(running, destination) {
        val target = destination
        if (running && target != null) while (true) {
            delay(1_000)
            val remaining = Geo.distanceMeters(current, target)
            val step = minOf(5.0, remaining)
            current = Geo.interpolate(current, target, if (remaining == 0.0) 1.0 else step / remaining)
            activeSeconds++
            if (remaining <= 5.0) { running = false; paused = false; message = "Destino alcançado"; break }
        }
    }

    MaterialTheme { Surface(Modifier.fillMaxSize()) { Column(Modifier.padding(24.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("Fake Loc", style = MaterialTheme.typography.headlineMedium)
        Text("Simulação interna para desenvolvimento e testes autorizados. Não altera a localização sistêmica.")
        Text("Posição simulada: %.5f, %.5f".format(current.latitude, current.longitude))
        OutlinedTextField(latitude, { latitude = it }, label = { Text("Latitude do destino") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal))
        OutlinedTextField(longitude, { longitude = it }, label = { Text("Longitude do destino") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal))
        Button(onClick = {
            val a = latitude.replace(',', '.').toDoubleOrNull(); val b = longitude.replace(',', '.').toDoubleOrNull()
            try { if (a == null || b == null) throw IllegalArgumentException(); destination = Coordinate(a, b); paused = false; message = "Destino definido" }
            catch (_: IllegalArgumentException) { message = "Coordenadas inválidas. Latitude: −90 a 90; longitude: −180 a 180." }
        }) { Text("Definir destino") }
        Text("Distância restante: %.0f m · Velocidade: %s · Tempo ativo: %d s".format(destination?.let { Geo.distanceMeters(current, it) } ?: 0.0, if (running) "5 m/s" else "0 m/s", activeSeconds))
        Text(message)
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(enabled = !running && !paused && destination != null, onClick = { running = true; message = "Simulação interna em movimento" }) { Text("Iniciar") }
            Button(enabled = running, onClick = { running = false; paused = true; message = "Simulação pausada" }) { Text("Pausada") }
            Button(enabled = paused, onClick = { running = true; paused = false; message = "Simulação retomada" }) { Text("Retomar") }
            Button(onClick = { running = false; paused = false; current = home; activeSeconds = 0; message = "Simulação parada" }) { Text("Parar") }
        }
    } } }
}
