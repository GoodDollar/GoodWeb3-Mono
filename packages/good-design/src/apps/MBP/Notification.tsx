import React from "react";
import success from "../../assets/images/billy-celebration.png";
import warning from "../../assets/images/billy-grin.png";
import error from "../../assets/images/billy-oops.png";
import waiting from "../../assets/images/billy-waiting.png";
const Notification = ({ type, message, onClose }) => {
  var img;
  if (type == "success") {
    img = success;
  } else if (type == "warning") {
    img = warning;
  } else if (type == "error") {
    img = error;
  } else {
    img = waiting;
  }
  return (
    <div
      style={{
        position: "fixed",
        top: "10px",
        right: "10px",
        padding: "10px",
        backgroundColor: type === "error" ? "red" : type === "warning" ? "yellow" : "green",
        color: "white",
        borderRadius: "5px",
        zIndex: "1000"
      }}
    >
      <img src={img}></img>
      <a
        style={{
          fontFamily: "Roboto",
          fontSize: "x-large",
          fontWeight: "400"
        }}
      >
        {message}
      </a>
      <button
        style={{
          marginLeft: "10px",
          backgroundColor: "transparent",
          border: "none",
          color: "white",
          cursor: "pointer"
        }}
        onClick={onClose}
      >
        X
      </button>
    </div>
  );
};

export default Notification;
