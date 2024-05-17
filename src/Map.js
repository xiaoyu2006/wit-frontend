import React, { Fragment, useEffect, useState } from "react";
import { scaleLog } from "d3-scale";
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

const MapChart = ({ fetchUrl }) => {
  // Data: Country code -> value
  const [data, setData] = useState({});
  const [err, setErr] = useState(null);

  const colorScale = scaleLog([1, Math.max(...Object.values(data))], ["blue", "red"]);

  const update_data = () => {
    fetch('/GeoLite2-Country.mmdb')
      .then(response => response.arrayBuffer())
      .then(
        b => {
          const buffer = Buffer.from(b);
          const reader = new mmdb.Reader(buffer);

          const get_loc = (dest) => {
            const loc = reader.get(dest);
            if (!loc) return null;
            let iso2;
            if (loc.country) {
              iso2 = loc.country.iso_code;
            } else if (loc.registered_country) {
              iso2 = loc.registered_country.iso_code;
            } else {
              return null;
            }
            return getCountryISO3(iso2);
          };
          fetch(fetchUrl)
            .then(r => r.json())
            .then(json => {
              let result = {};
              for (var key in json) {
                let [source, dest] = key.split(" -> ");

                let iso3_dest = get_loc(dest);
                if (!iso3_dest) continue;
                if (!(iso3_dest in result)) {
                  result[iso3_dest] = 0;
                }
                result[iso3_dest] += json[key]["total_count"];

                let iso3_source = get_loc(source);
                if (!iso3_source) continue;
                if (!(iso3_source in result)) {
                  result[iso3_source] = 0;
                }
                result[iso3_source] += json[key]["total_count"];
              }
              setData(result);
            })
            .catch(e => {
              setErr(e);
            });
        })
  }

  const [counter, setCounter] = useState(0);
  useEffect(() => {
    const intervalId = setInterval(() => {
      update_data();
      setCounter(counter + 1);
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <Fragment>
      {err && <p style={{ color: "red" }}>{err.toString()}</p>}
      <ComposableMap
        projectionConfig={{
          rotate: [-10, 0, 0],
          scale: 147
        }}>
        <Sphere stroke="#E4E5E6" strokeWidth={0.5} />
        <Graticule stroke="#E4E5E6" strokeWidth={0.5} />
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              let entry = data[geo.id];
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={entry ? colorScale(entry) : "gray"} />);
            })}
        </Geographies>
      </ComposableMap>
    </Fragment>
  );
};

export default MapChart;

