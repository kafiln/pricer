import { Box, Container, Group, Select, Table, Title } from "@mantine/core";
import axios from "axios";
import { useEffect, useState } from "react";
import cities from "./data/cities.json";
import data from "./data/stations.json";

const API_URL =
  "https://cors-anywhere-kafil.herokuapp.com/https://total.smarteez.eu/submit/";

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
      const promises = ids.map((id) => axios.get(`${API_URL}?station=${id}`));
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
      <Group position="center" direction="column" spacing={"lg"}>
        <Title>Prix du carburant</Title>
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
        <Box>
          {stations && stations.length > 0 && (
            <Table striped>
              <thead>
                <tr>
                  <th>Station</th>
                  <th>Diesel</th>
                  <th>Essence</th>
                </tr>
              </thead>
              <tbody>
                {stations.map(
                  (station: Station, index: number) =>
                    station.diesel && (
                      <tr key={index}>
                        <td style={{ textTransform: "capitalize" }}>
                          {station.name}
                        </td>
                        <td>{station.diesel}</td>
                        <td>{station.essence}</td>
                      </tr>
                    )
                )}
              </tbody>
            </Table>
          )}
        </Box>
      </Group>
    </Container>
  );
};
export default App;
