import React, { useState } from "react";

import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

import { SignIn } from "@/components/templates/SignIn";
import { app } from "@/libs/firebase";
import { makeInstance } from "@/libs/api/axios";

export const SignInView = () => {
  const [signinData, setSigninData] = useState({
    email: "",
    password: "",
  });

  const auth = getAuth(app);

  const navigate = useNavigate();

  const instance = makeInstance();

  const signin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(
        auth,
        signinData.email,
        signinData.password
      );
      await instance.get("/signin");
      // TODO signupDataを空にする
      navigate("/main");
    } catch (error) {
      console.log(error);
      alert("ログインに失敗しました");
    }
  };

  return (
    <div>
      <SignIn
        signinData={signinData}
        setSigninData={setSigninData}
        signin={signin}
      />
    </div>
  );
};
