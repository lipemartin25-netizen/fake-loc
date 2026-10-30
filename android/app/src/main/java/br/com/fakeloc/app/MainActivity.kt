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

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) { super.onCreate(savedInstanceState); setContent { FakeLocScreen() } }
}

@Composable private fun FakeLocScreen() {
    var latitude by remember { mutableStateOf("-23.5505") }; var longitude by remember { mutableStateOf("-46.6333") }
    var message by remember { mutableStateOf("Simulação interna parada") }; var running by remember { mutableStateOf(false) }
    MaterialTheme { Surface(Modifier.fillMaxSize()) { Column(Modifier.padding(24.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("Fake Loc", style = MaterialTheme.typography.headlineMedium)
        Text("Simulação local para desenvolvimento e testes autorizados. Não altera localização sistêmica.")
        OutlinedTextField(latitude, { latitude = it }, label = { Text("Latitude") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal))
        OutlinedTextField(longitude, { longitude = it }, label = { Text("Longitude") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal))
        Button(onClick = { val a=latitude.replace(',', '.').toDoubleOrNull(); val b=longitude.replace(',', '.').toDoubleOrNull(); message = if (a != null && b != null && a in -90.0..90.0 && b in -180.0..180.0) "Destino definido: %.5f, %.5f".format(a,b) else "Latitude/longitude inválida. Verifique os limites." }) { Text("Definir destino") }
        Button(onClick = { running = !running; message = if (running) "Simulação interna ativa · 0 m/s" else "Simulação interna parada" }) { Text(if(running) "Parar simulação" else "Iniciar simulação") }
        Text(message)
    } } }
}
