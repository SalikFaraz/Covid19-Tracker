import React, { useState, useEffect } from "react";
import {
  MenuItem,
  FormControl,
  Select,
  Card,
  CardContent,
} from "@material-ui/core";
import "./App.css";
import InfoBox from "./components/InfoBox";
import Table from "./components/Table";
import { sortData, prettyPrintStat } from "./utils";
import numeral from "numeral";

function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [casesType, setCasesType] = useState("cases");

  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then((res) => res.json())
      .then((data) => {
        setCountryInfo(data);
      });
  }, []);

  useEffect(() => {
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
        .then((res) => res.json())
        .then((data) => {
          const countries = data.map((country) => ({
            name: country.country,
            value: country.countryInfo.iso2,
          }));
          const sortedData = sortData(data);
          setTableData(sortedData);
          setCountries(countries);
        });
    };
    getCountriesData();
  }, []);
  const onCountryChange = async (e) => {
    const countryCode = e.target.value;
    // setCountry(countryCode);

    const url =
      countryCode === "worldwide"
        ? "https://disease.sh/v3/covid-19/all"
        : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setCountry(countryCode);
        setCountryInfo(data);
      });
  };

  return (
    <div className="app">
      <div className="app-left">
        <div className="app-header">
          <h1>COVID-19 TRACKER</h1>
          <FormControl className="app-dropdown">
            <Select
              variant="outlined"
              onChange={onCountryChange}
              value={country}
            >
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {countries.map((country) => (
                <MenuItem value={country.value}>{country.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <div className="app-stats">
          <InfoBox
            onClick={(e) => setCasesType("cases")}
            active={casesType === "cases"}
            isRed
            className="stats-box"
            title="Confirmed Today"
            cases={prettyPrintStat(countryInfo.todayCases)}
            total={numeral(countryInfo.cases).format("0.0a")}
          />

          <InfoBox
            onClick={(e) => setCasesType("active")}
            active={casesType === "active"}
            isRed
            className="stats-box"
            title="Active"
            cases={prettyPrintStat(countryInfo.active)}
            total={numeral(countryInfo.cases).format("0.0a")}
          />

          <InfoBox
            onClick={(e) => setCasesType("recovered")}
            active={casesType === "recovered"}
            className="stats-box"
            title="Recovered Today"
            cases={prettyPrintStat(countryInfo.todayRecovered)}
            total={numeral(countryInfo.recovered).format("0.0a")}
          />

          <InfoBox
            onClick={(e) => setCasesType("deaths")}
            active={casesType === "deaths"}
            isRed
            className="stats-box"
            title="Deceased Today"
            cases={prettyPrintStat(countryInfo.todayDeaths)}
            total={numeral(countryInfo.deaths).format("0.0a")}
          />
        </div>
      </div>
      <div className="app-right">
        <Card>
          <CardContent>
            <h3>Live Cases by Country </h3>
            <Table countries={tableData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;
