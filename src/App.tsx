import { Container, Group, Select } from "@mantine/core";
import axios from "axios";
import { useEffect, useState } from "react";
import cities from "./data/cities.json";
import data from "./data/stations.json";

const isDev = () => process.env.NODE_ENV === "development";

const API_URL = isDev()
  ? "/"
  : "https://cors-anywhere.herokuapp.com/https://total.smarteez.eu/";

interface Station {
  id?: string;
  name?: string;
  diesel?: string;
  essence?: string;
  excellium?: string;
}

const App = () => {
  const [city, setCity] = useState("");
  const [stations, setStations] = useState<Station[]>([]);

  useEffect(() => {
    async function fetchData() {
      if (!city) {
        setStations([]);
        return;
      }
      const chosenStations: Station[] = data.filter(
        (item) => item.city.name === city
      )[0].stations;
      const ids = chosenStations.map((item) => item.id);
      const promises = ids.map((id) =>
        axios.get(`${API_URL}submit/?station=${id}`)
      );
      await Promise.all(promises)
        .then((res) => {
          const resultData = res.map((item) => item.data);
          resultData.forEach((item, index) => {
            chosenStations[index].diesel = item.prix?.prix_diesel;
            chosenStations[index].essence = item.prix?.prix_essence;
            chosenStations[index].excellium = item.prix?.prix_aditive;
          });
        })
        .catch((_err) => console.log("err"));
      setStations(chosenStations);
    }
    fetchData();
  }, [city]);

  return (
    <Container>
      <Group position="center" direction="column">
        <h1>Prix du carburant</h1>
        <Select
          searchable
          clearable
          label="Choisir la ville"
          placeholder="Ville"
          data={cities}
          value={city}
          onChange={setCity as (value: string) => void}
          transition="pop-top-left"
          transitionDuration={80}
          transitionTimingFunction="ease"
        ></Select>
      </Group>
      {stations &&
        stations.map(
          (station: Station) =>
            station.diesel && (
              <Group key={station.id} direction="column">
                <h2>{station.name}</h2>
                <p>Diesel: {station.diesel}</p>
                <p>Essence: {station.essence}</p>
                <p>Excellium: {station.excellium}</p>
              </Group>
            )
        )}
    </Container>
  );
};
export default App;
