import "./App.css";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import "firebase/compat/analytics";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useState } from "react";
import { useRef } from "react";
import DummyImg from "./assets/dummyImg.jpeg";

firebase.initializeApp({
  apiKey: "AIzaSyCvOyNsEabF9qxJ6XjG-PBEywtd9jykMrc",
  authDomain: "myfirst-336407.firebaseapp.com",
  projectId: "myfirst-336407",
  storageBucket: "myfirst-336407.appspot.com",
  messagingSenderId: "924435253527",
  appId: "1:924435253527:web:6c54a14441f71bd1f9cf52",
  measurementId: "G-1B6PZBN1KL",
});

const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();

function App() {
  const [user] = useAuthState(auth);
  return (
    <>
      <div className="main-heading">
        <h1>Chat Room</h1>
        <SignOut />
      </div>
      {user ? <ChatRoom name={user.displayName} /> : <SignIn />}
    </>
  );
}

export default App;

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <>
      <button onClick={signInWithGoogle} className="sign-in">
        SignIn with google
      </button>
    </>
  );
}

function SignOut() {
  return (
    auth.currentUser && (
      <button className="sign-out" onClick={() => auth.signOut()}>
        Sign Out
      </button>
    )
  );
}

function ChatRoom({ name }) {
  const dummy = useRef();
  const [formValue, setFormValue] = useState("");
  const messagesRef = firestore.collection("messages");
  const query = messagesRef.orderBy("createdAt").limit(25);
  const [messages] = useCollectionData(query, { idField: "id" });

  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
      name: name,
    });
    setFormValue("");
    dummy.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <div>
        {messages &&
          messages.map((el) => <ChatMessage key={el.id} message={el} />)}
        <span ref={dummy}></span>
      </div>

      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="type your text"
        />
        <button type="submit" disabled={!formValue}>
          Send
        </button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL, name } = props.message;

  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  function DefaultImage(e) {
    e.target.src = DummyImg;
  }

  return (
    <>
      <div className={`message ${messageClass}`}>
        <div className="messageImage">
          <img src={photoURL} onError={DefaultImage} />
          <i>{name}</i>
        </div>
        <p>{text}</p>
      </div>
    </>
  );
}
