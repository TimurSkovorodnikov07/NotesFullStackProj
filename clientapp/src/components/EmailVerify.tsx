import { useEffect, useRef, useState } from "react";
import { InputComponent } from "./InputComponent";
import { codeResend, emailVerify } from "../requests/authRequests";
import IEmailVerifyParams from "../interfaces/parametrs/IEmailVerifyParams";
import ICodeResendResponse from "../interfaces/responses/ICodeResendResponse";
import ITokens from "../interfaces/ITokens";
import Cookies from "js-cookie";
import { refreshTokenInCookies } from "../data/cookiesName";
import { accessTokenInLocalStorage } from "../data/localStorageItemName";
import { useNavigate } from "react-router-dom";

export default function EmailVerify({
  userId,
  codeDiedAfterSeconds,
  codeLength,
}: IEmailVerifyParams) {
  const navigate = useNavigate();

  const [time, setTime] = useState(codeDiedAfterSeconds);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    setTimeout(() => {
      setTime(time - 1);
    }, 1000);
  }, []);

  async function emailVer(code: string) {
    //Поздравте меня, я даун, вметос того чтобы покопаться что за хуйня этот then()
    //Я забил и думал дохуя знаю, ну и короче проебал часа 2
    const result = await emailVerify(userId, code);
    const tokens = result?.data;

    if (tokens != undefined && result?.status === 200) {
      localStorage.setItem(accessTokenInLocalStorage, tokens.accessToken);
      Cookies.set(refreshTokenInCookies, tokens.refreshToken);
      navigate("/");
    } else {
      setErrorText("Incorrect code");
    }
  }
  async function resend() {
    const result = await codeResend(userId);
    switch (result?.status) {
      case 200:
        const data: ICodeResendResponse = result?.data;
        setTime(parseInt(data.codeDiedAfterSeconds));
        break;
      case 404:
        console.error(`Даун, userId такого на серваке нету, мб userId = ""`);
        break;
    }
  }

  return (
    <>
      <div>
        {time > 0 ? (
          <p>The code will become invalid after: {time} seconds</p>
        ) : (
          <p>Time is up, send the code again, and write a new code below</p>
        )}
      </div>
      <div>
        <InputComponent
          id="codeInput"
          inputType="text"
          labelText="Code: "
          inputOtherProps={{
            required: true,
            onChange: (event: any) => {
              if (parseInt(event?.target?.value?.length ?? "0") !== codeLength)
                setErrorText(`The code must be ${codeLength} characters long`);
              else {
                setErrorText("");
                emailVer(event?.target?.value ?? "");
              }
            },
          }}
        />
      </div>
      <div>
        <p id="errorText">{errorText}</p>
        <p>
          If the code has not yet been sent to your email address, check the
          quality The Internet and whether you entered your email address
          accurately and whether our message does not end up in spam
        </p>
        <button onClick={async () => await resend()}>
          Send the code again
        </button>
      </div>
    </>
  );
}
