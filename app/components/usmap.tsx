'use client';

import { geoCentroid } from 'd3-geo';
import { Feature, FeatureCollection, Geometry } from 'geojson';
import { useEffect, useState } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';

const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";
const subRegionsUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json";

interface GeographyProperties {
  name?: string;
  NAME?: string;
  STUSPS?: string;
}

interface SubRegionProperties {
  name?: string;
  NAME?: string;
  state?: string;
  STATEFP?: string;
}

interface StateInfo {
  name: string;
  slogan: string;
  abbreviation: string;
}

const stateInfo: { [key: string]: StateInfo } = {
  "Alabama": { name: "Alabama", slogan: "Audemus jura nostra defendere", abbreviation: "AL" },
  "Alaska": { name: "Alaska", slogan: "North to the Future", abbreviation: "AK" },
  "Arizona": { name: "Arizona", slogan: "Ditat Deus", abbreviation: "AZ" },
  "Arkansas": { name: "Arkansas", slogan: "The Natural State", abbreviation: "AR" },
  "California": { name: "California", slogan: "Eureka", abbreviation: "CA" },
  "Colorado": { name: "Colorado", slogan: "Nil sine numine", abbreviation: "CO" },
  "Connecticut": { name: "Connecticut", slogan: "Qui transtulit sustinet", abbreviation: "CT" },
  "Delaware": { name: "Delaware", slogan: "Liberty and Independence", abbreviation: "DE" },
  "Florida": { name: "Florida", slogan: "In God We Trust", abbreviation: "FL" },
  "Georgia": { name: "Georgia", slogan: "Wisdom, Justice, and Moderation", abbreviation: "GA" },
  "Hawaii": { name: "Hawaii", slogan: "Ua Mau ke Ea o ka ʻĀina i ka Pono", abbreviation: "HI" },
  "Idaho": { name: "Idaho", slogan: "Esto perpetua", abbreviation: "ID" },
  "Illinois": { name: "Illinois", slogan: "State Sovereignty, National Union", abbreviation: "IL" },
  "Indiana": { name: "Indiana", slogan: "The Crossroads of America", abbreviation: "IN" },
  "Iowa": { name: "Iowa", slogan: "Our liberties we prize and our rights we will maintain", abbreviation: "IA" },
  "Kansas": { name: "Kansas", slogan: "Ad astra per aspera", abbreviation: "KS" },
  "Kentucky": { name: "Kentucky", slogan: "United we stand, divided we fall", abbreviation: "KY" },
  "Louisiana": { name: "Louisiana", slogan: "Union, Justice, Confidence", abbreviation: "LA" },
  "Maine": { name: "Maine", slogan: "Dirigo", abbreviation: "ME" },
  "Maryland": { name: "Maryland", slogan: "Fatti maschii, parole femine", abbreviation: "MD" },
  "Massachusetts": { name: "Massachusetts", slogan: "Ense petit placidam sub libertate quietem", abbreviation: "MA" },
  "Michigan": { name: "Michigan", slogan: "Si quaeris peninsulam amoenam circumspice", abbreviation: "MI" },
  "Minnesota": { name: "Minnesota", slogan: "L'Étoile du Nord", abbreviation: "MN" },
  "Mississippi": { name: "Mississippi", slogan: "Virtute et armis", abbreviation: "MS" },
  "Missouri": { name: "Missouri", slogan: "Salus populi suprema lex esto", abbreviation: "MO" },
  "Montana": { name: "Montana", slogan: "Oro y Plata", abbreviation: "MT" },
  "Nebraska": { name: "Nebraska", slogan: "Equality Before the Law", abbreviation: "NE" },
  "Nevada": { name: "Nevada", slogan: "All for Our Country", abbreviation: "NV" },
  "New Hampshire": { name: "New Hampshire", slogan: "Live Free or Die", abbreviation: "NH" },
  "New Jersey": { name: "New Jersey", slogan: "Liberty and Prosperity", abbreviation: "NJ" },
  "New Mexico": { name: "New Mexico", slogan: "Crescit eundo", abbreviation: "NM" },
  "New York": { name: "New York", slogan: "Excelsior", abbreviation: "NY" },
  "North Carolina": { name: "North Carolina", slogan: "Esse quam videri", abbreviation: "NC" },
  "North Dakota": { name: "North Dakota", slogan: "Liberty and Union, Now and Forever, One and Inseparable", abbreviation: "ND" },
  "Ohio": { name: "Ohio", slogan: "With God, all things are possible", abbreviation: "OH" },
  "Oklahoma": { name: "Oklahoma", slogan: "Labor omnia vincit", abbreviation: "OK" },
  "Oregon": { name: "Oregon", slogan: "Alis volat propriis", abbreviation: "OR" },
  "Pennsylvania": { name: "Pennsylvania", slogan: "Virtue, Liberty and Independence", abbreviation: "PA" },
  "Rhode Island": { name: "Rhode Island", slogan: "Hope", abbreviation: "RI" },
  "South Carolina": { name: "South Carolina", slogan: "Dum spiro spero", abbreviation: "SC" },
  "South Dakota": { name: "South Dakota", slogan: "Under God the people rule", abbreviation: "SD" },
  "Tennessee": { name: "Tennessee", slogan: "Agriculture and Commerce", abbreviation: "TN" },
  "Texas": { name: "Texas", slogan: "Friendship", abbreviation: "TX" },
  "Utah": { name: "Utah", slogan: "Industry", abbreviation: "UT" },
  "Vermont": { name: "Vermont", slogan: "Freedom and Unity", abbreviation: "VT" },
  "Virginia": { name: "Virginia", slogan: "Sic semper tyrannis", abbreviation: "VA" },
  "Washington": { name: "Washington", slogan: "Al-ki", abbreviation: "WA" },
  "West Virginia": { name: "West Virginia", slogan: "Montani semper liberi", abbreviation: "WV" },
  "Wisconsin": { name: "Wisconsin", slogan: "Forward", abbreviation: "WI" },
  "Wyoming": { name: "Wyoming", slogan: "Equal Rights", abbreviation: "WY" }
};

export default function USMap() {
    const [position, setPosition] = useState<{ coordinates: [number, number]; zoom: number }>({ coordinates: [-98, 38], zoom: 1 });
    const [selectedState, setSelectedState] = useState<string | null>(null);
    const [selectedSubRegion, setSelectedSubRegion] = useState<string | null>(null);
    const [subRegions, setSubRegions] = useState<FeatureCollection | null>(null);
    const [debug, setDebug] = useState<string>('');
  
    useEffect(() => {
      fetch(subRegionsUrl)
        .then(response => response.json())
        .then(data => {
          if (data && data.features && Array.isArray(data.features)) {
            setSubRegions(data);
            setDebug(`Loaded ${data.features.length} sub-regions`);
          } else {
            throw new Error('Invalid sub-regions data format');
          }
        })
        .catch(error => {
          console.error('Error loading sub-regions:', error);
          setDebug(`Error loading sub-regions: ${error.message}`);
          setSubRegions(null);
        });
    }, []);
  
    const handleStateClick = (geo: Feature<Geometry, GeographyProperties>) => {
      const stateName = geo.properties.name || geo.properties.NAME;
      if (stateName && stateInfo[stateName]) {
        setSelectedState(prevState => prevState === stateName ? null : stateName);
        setSelectedSubRegion(null);
        const centroid = geoCentroid(geo);
        setPosition({
          coordinates: centroid as [number, number],
          zoom: 5
        });
        setDebug(`Toggled state: ${stateName}`);
      } else {
        setDebug(`State not found in stateInfo: ${stateName || 'undefined'}`);
      }
    };
  
    const handleSubRegionClick = (geo: Feature<Geometry, SubRegionProperties>) => {
      const subRegionName = geo.properties.name || geo.properties.NAME;
      if (subRegionName) {
        setSelectedSubRegion(prevSubRegion => prevSubRegion === subRegionName ? null : subRegionName);
        setDebug(`Toggled sub-region: ${subRegionName}`);
      } else {
        setDebug('Sub-region name not found');
      }
    };
  
    const handleReset = () => {
      setPosition({ coordinates: [-98, 38], zoom: 1 });
      setSelectedState(null);
      setSelectedSubRegion(null);
      setDebug('Reset view');
    };
  
    return (
      <div className="relative w-full h-[600px]">
        <ComposableMap projection="geoAlbersUsa" className="w-full h-full">
          <ZoomableGroup
            zoom={position.zoom}
            center={position.coordinates}
            onMoveEnd={(p) => setPosition(p)}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const stateName = geo.properties.name || geo.properties.NAME;
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => handleStateClick(geo)}
                      style={{
                        default: { 
                          fill: selectedState === stateName ? "#FFA500" : "#D6D6DA", 
                          outline: "none" 
                        },
                        hover: { fill: "#A9A9A9", outline: "none" },
                        pressed: { fill: "#808080", outline: "none" }
                      }}
                    />
                  );
                })
              }
            </Geographies>
            {selectedState && subRegions && (
              <Geographies geography={subRegions}>
                {({ geographies }) => 
                  geographies.map((geo) => {
                    const subRegion = geo as Feature<Geometry, SubRegionProperties>;
                    const subRegionName = subRegion.properties.name || subRegion.properties.NAME;
                    const stateAbbr = stateInfo[selectedState]?.abbreviation;
                    if (subRegion.properties.state === stateAbbr || subRegion.properties.STATEFP === stateAbbr) {
                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          onClick={() => handleSubRegionClick(subRegion)}
                          style={{
                            default: { 
                              fill: selectedSubRegion === subRegionName ? "#FFD700" : "#FFA500", 
                              outline: "white",
                              strokeWidth: 0.5
                            },
                            hover: { fill: "#FFD700", outline: "white", strokeWidth: 0.5 },
                            pressed: { fill: "#FF8C00", outline: "white", strokeWidth: 0.5 }
                          }}
                        />
                      );
                    }
                    return null;
                  })
                }
              </Geographies>
            )}
          </ZoomableGroup>
        </ComposableMap>
        {selectedState && (
          <div className="absolute top-4 left-4 bg-white p-4 rounded shadow">
            <h2 className="text-xl font-bold">{selectedState} ({stateInfo[selectedState].abbreviation})</h2>
            <p>{stateInfo[selectedState].slogan}</p>
            {selectedSubRegion && (
              <p className="mt-2">Selected sub-region: {selectedSubRegion}</p>
            )}
          </div>
        )}
        {position.zoom > 1 && (
          <button
            onClick={handleReset}
            className="absolute bottom-4 right-4 px-4 py-2 bg-gray-500 text-white rounded"
          >
            Reset View
          </button>
        )}
        <div className="absolute bottom-4 left-4 bg-white p-2 rounded shadow">
          Debug: {debug}
        </div>
      </div>
    );
  }