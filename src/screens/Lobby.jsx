import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";
import { Card, TextField, Button, Typography } from "@mui/material";
import { BabyChangingStation } from "@mui/icons-material";

const LobbyScreen = () => {
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");

  const socket = useSocket();
  const navigate = useNavigate();

  const handleSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      socket.emit("room:join", { email, room });
    },
    [email, room, socket]
  );

  const handleJoinRoom = useCallback(
    (data) => {
      const { room } = data;
      navigate(`/room/${room}`);
    },
    [navigate]
  );

  useEffect(() => {
    socket.on("room:join", handleJoinRoom);
    return () => {
      socket.off("room:join", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(to right, #fbc2eb, #a6c1ee)',
      fontFamily: 'Comfortaa, cursive'
    }}>
      <Card style={{ padding: '2rem', maxWidth: '400px', width: '100%', borderRadius: '12px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          <BabyChangingStation style={{ fontSize: '2rem', color: '#d81b60', marginRight: '8px' }} />
          Baby Monitor Lobby
        </Typography>
        <Typography variant="body1" color="textSecondary" align="center" gutterBottom>
          Connect to the incubator and keep an eye on your little one.
        </Typography>
        <form onSubmit={handleSubmitForm}>
          <TextField
            type="email"
            label="Email ID"
            variant="outlined"
            fullWidth
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
          />
          <TextField
            type="text"
            label="Room Number"
            variant="outlined"
            fullWidth
            required
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            margin="normal"
          />
          <Button type="submit" variant="contained" fullWidth style={{ backgroundColor: '#d81b60', color: '#fff', marginTop: '1rem' }}>
            Join
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default LobbyScreen;