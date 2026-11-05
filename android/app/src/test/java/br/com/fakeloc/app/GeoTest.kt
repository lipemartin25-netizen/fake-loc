package br.com.fakeloc.app

import org.junit.Assert.assertEquals
import org.junit.Test

class GeoTest {
    @Test fun computesKnownDistanceAndCardinalBearing() {
        val sp=Coordinate(-23.5505,-46.6333); val rio=Coordinate(-22.9068,-43.1729)
        assertEquals(360749.3,Geo.distanceMeters(sp,rio),1.0)
        assertEquals(90.0,Geo.initialBearing(Coordinate(0.0,0.0),Coordinate(0.0,1.0)),1e-9)
    }
    @Test fun followsShortAntimeridianArcAndRejectsInvalidCoordinates() {
        val west=Coordinate(0.0,179.9); val east=Coordinate(0.0,-179.9)
        assertEquals(22239.0,Geo.distanceMeters(west,east),10.0)
        assertEquals(180.0, kotlin.math.abs(Geo.interpolate(west,east,0.5).longitude),1e-8)
        try { Coordinate(90.1,0.0); throw AssertionError("expected invalid latitude") } catch (_: IllegalArgumentException) { }
    }
    @Test fun projectsCoordinateAlongBearingAndDistance() {
        val start = Coordinate(0.0, 0.0)
        val north = Geo.projectCoordinate(start, 0.0, 111195.0)
        assertEquals(1.0, north.latitude, 0.05)
        assertEquals(0.0, north.longitude, 1e-4)

        val east = Geo.projectCoordinate(start, 90.0, 111195.0)
        assertEquals(0.0, east.latitude, 1e-4)
        assertEquals(1.0, east.longitude, 0.05)

        assertEquals(start, Geo.projectCoordinate(start, 45.0, 0.0))
    }
}
