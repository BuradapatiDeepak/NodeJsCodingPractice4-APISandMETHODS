const express = require("express");
const app = express();
app.use(express.json());
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
let db = null;
const DbPath = path.join(__dirname, "cricketTeam.db");
const initializingDBAndServer = async () => {
  try {
    db = await open({
      filename: DbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Connected to Server Securely");
    });
  } catch (error) {
    console.log(`DB Error: %{error.message}`);
    process.exit(1);
  }
};

initializingDBAndServer();

// API1 - Returning a list of all players in the team
app.get("/players/", async (request, response) => {
  const playerDetails = `
    SELECT * FROM cricket_team`;
  const players = await db.all(playerDetails);
  let newArray = [];
  for (let eachPlayer in players) {
    let object = {
      playerId: players[eachPlayer].player_id,
      playerName: players[eachPlayer].player_name,
      jerseyNumber: players[eachPlayer].jersey_number,
      role: players[eachPlayer].role,
    };
    newArray.push(object);
  }
  response.send(newArray);
});

// API2 - creating new player in the team
app.post("/players/", async (request, response) => {
  const playerDetailsForPost = request.body;
  const { playerName, jerseyNumber, role } = playerDetailsForPost;
  const newPlayerDetails = `
  INSERT INTO 
  cricket_team (player_name, jersey_number, role)
  VALUES (
      '${playerName}', 
       ${jerseyNumber}, 
      '${role}')`;
  await db.run(newPlayerDetails);
  response.send("Player Added to Team");
});

//API3 - Returns a player based on player ID
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const onePlayerDetails = `
    SELECT * FROM cricket_team WHERE player_id = ${playerId}`;
  const details = await db.get(onePlayerDetails);
  const { player_id, player_name, jersey_number, role } = details;
  response.send({
    playerId: player_id,
    playerName: player_name,
    jerseyNumber: jersey_number,
    role: role,
  });
});

//API4 - Updates the details of players in the team
app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const updatingPlayerDetails = request.body;
  const { playerName, jerseyNumber, role } = updatingPlayerDetails;
  const DBDataModification = `
  UPDATE cricket_team
  SET player_name = '${playerName}', 
  jersey_number = ${jerseyNumber}, 
  role = '${role}'
  WHERE player_id = ${playerId};
  `;
  await db.run(DBDataModification);
  response.send("Player Details Updated");
});

//API5 - Deletes a player from the team
app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const deletingPlayer = `
    DELETE FROM cricket_team WHERE player_id = ${playerId}`;
  await db.run(deletingPlayer);
  response.send("Player Removed");
});

module.exports = app;
