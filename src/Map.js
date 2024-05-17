import React, { useEffect, useState } from "react";
import { csv } from "d3-fetch";
import { scaleLinear } from "d3-scale";
import {
  ComposableMap,
  Geographies,
  Geography,
  Sphere,
  Graticule
} from "react-simple-maps";
import * as mmdb from 'mmdb-lib';
import getCountryISO3 from 'country-iso-2-to-3';

const geoUrl = "/features.json"

const colorScale = scaleLinear()
  .domain([0.29, 0.68])
  .range(["#ffedea", "#ff5233"]);

const MapChart = () => {
  // Data: Country code -> value
  const [data, setData] = useState({});
  const [reader, setReader] = useState(null);

  useEffect(() => {
    fetch('/GeoLite2-Country.mmdb').then(
      response => response.arrayBuffer()
    ).then(
      buffer => {
        const reader = new mmdb.Reader(new Uint8Array(buffer));
        setReader(reader);
      })
  }, []);

  useEffect(() => {
    fetch('localhost:3648')
      .then(r => r.json())
      .then(json => {
        let result = {}
        for (var key in json) {
          let dest = key.split(" -> ")[1];
          let loc = reader.get(dest);
          let iso2 = loc.country.iso_code;
          let iso3 = getCountryISO3(iso2);
          result[iso3] = data[key]["total_count"];
        } setData(result);
      })
  }, [reader]);

  return (
    <ComposableMap
      projectionConfig={{
        rotate: [-10, 0, 0],
        scale: 147
      }}>
      <Sphere stroke="#E4E5E6" strokeWidth={0.5} />
      <Graticule stroke="#E4E5E6" strokeWidth={0.5} />
      {data.length > 0 && (
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              let entry = data[geo.id];
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={entry ? colorScale(entry) : "#F5F4F6"} />);
            })}
        </Geographies>)}
    </ComposableMap>);
};

export default MapChart;

