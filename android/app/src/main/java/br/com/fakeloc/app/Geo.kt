package br.com.fakeloc.app

import kotlin.math.*

data class Coordinate(val latitude: Double, val longitude: Double) {
    init { require(latitude.isFinite() && longitude.isFinite() && latitude in -90.0..90.0 && longitude in -180.0..180.0) { "Coordenada fora dos limites válidos" } }
}

object Geo {
    const val EARTH_RADIUS_M = 6_371_008.8
    fun normalizeLongitude(value: Double): Double = ((value + 180.0) % 360.0 + 360.0) % 360.0 - 180.0
    fun distanceMeters(a: Coordinate, b: Coordinate): Double {
        val rad = Math.PI / 180.0
        val dLat = (b.latitude - a.latitude) * rad
        val dLon = normalizeLongitude(b.longitude - a.longitude) * rad
        val h = sin(dLat / 2).pow(2) + cos(a.latitude * rad) * cos(b.latitude * rad) * sin(dLon / 2).pow(2)
        return EARTH_RADIUS_M * 2 * atan2(sqrt(h.coerceIn(0.0, 1.0)), sqrt((1 - h).coerceIn(0.0, 1.0)))
    }
    fun initialBearing(a: Coordinate, b: Coordinate): Double {
        if (distanceMeters(a, b) < 1e-9) return 0.0
        val rad = Math.PI / 180.0; val p1=a.latitude*rad; val p2=b.latitude*rad; val dl=normalizeLongitude(b.longitude-a.longitude)*rad
        return (atan2(sin(dl)*cos(p2), cos(p1)*sin(p2)-sin(p1)*cos(p2)*cos(dl))*180/Math.PI+360)%360
    }
    fun interpolate(a: Coordinate, b: Coordinate, fraction: Double): Coordinate {
        val distance=distanceMeters(a,b); if (distance==0.0) return a
        val f=fraction.coerceIn(0.0,1.0); val rad=Math.PI/180.0; val p1=a.latitude*rad; val l1=a.longitude*rad
        val bearing=initialBearing(a,b)*rad; val arc=distance*f/EARTH_RADIUS_M
        val p2=asin(sin(p1)*cos(arc)+cos(p1)*sin(arc)*cos(bearing))
        val l2=l1+atan2(sin(bearing)*sin(arc)*cos(p1),cos(arc)-sin(p1)*sin(p2))
        return Coordinate(p2/rad,normalizeLongitude(l2/rad))
    }
    fun projectCoordinate(origin: Coordinate, bearingDeg: Double, distanceMeters: Double): Coordinate {
        if (!distanceMeters.isFinite() || distanceMeters == 0.0) return origin
        val rad = Math.PI / 180.0
        val p1 = origin.latitude * rad
        val l1 = origin.longitude * rad
        val arc = distanceMeters / EARTH_RADIUS_M
        val bRad = ((bearingDeg % 360.0 + 360.0) % 360.0) * rad
        val p2 = asin(sin(p1) * cos(arc) + cos(p1) * sin(arc) * cos(bRad))
        val l2 = l1 + atan2(sin(bRad) * sin(arc) * cos(p1), cos(arc) - sin(p1) * sin(p2))
        return Coordinate(p2 / rad, normalizeLongitude(l2 / rad))
    }
}
