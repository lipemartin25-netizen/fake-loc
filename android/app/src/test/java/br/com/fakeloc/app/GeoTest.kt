package br.com.fakeloc.app

import org.junit.Assert.assertEquals
import org.junit.Test

class GeoTest {
    @Test fun coordinateRangesAreExplicit() {
        assertEquals(true, -23.5 in -90.0..90.0)
        assertEquals(false, 90.1 in -90.0..90.0)
    }
}
