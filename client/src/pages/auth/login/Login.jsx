import React, { useEffect } from 'react'
import Logo from '../../../assets/brandlogo/logo-black.png';
import google from '../../../assets/login/google.svg';
import { useTranslation } from 'react-i18next'
import { MdOutlineAlternateEmail } from 'react-icons/md';
import { GiPadlock } from 'react-icons/gi';
import { AiFillEyeInvisible, AiFillEye } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import { auth, googleAuthProvider } from '../../../firebase';
import { Oval } from 'react-loader-spinner';
import authService from '../../../services/auth';
import {
  LoginWrapper,
  Section,
  Form,
  Text
} from './style';
import { useDispatch, useSelector } from 'react-redux';



const Login = () => {
  const { t } = useTranslation();
  const { loading, visible, showPassword, userInfo } = useSelector(state => state.userLogin);
  const navigate = useNavigate();
  const dispatch = useDispatch();



  //prevent logged in users from accessing forgot password page
  useEffect(() => {
      if(userInfo && userInfo.token) {
          navigate('/');
      }
  }, [userInfo])

  //redirect based on roles
  const roleBasedRedirect = (res) => {
    if (res.data.role === "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate(`/${encodeURI(t('user'))}/${encodeURI(t('history'))}`);
    }
  };



  const togglePassword = () => {
    dispatch({type: 'TOGGLE_PASSWORD'});
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    let email = e.target.email.value
    let password = e.target.password.value;

    dispatch({type: 'USER_LOGIN_REQUEST'});

    if(!email || !password) {
      toast.error(t('Email and password is required'));
      setTimeout(() =>  dispatch({type: "USER_LOGIN_FAIL"}), 6000);
      return;
  }

  if (password.length < 6) {
      toast.error(t('Password must be at least 6 characters long'));
      setTimeout(() =>  dispatch({type: "USER_LOGIN_FAIL"}), 6000);
      return;
  }

    try {
      const result = await auth.signInWithEmailAndPassword(email, password);
      const { user } = result;
      const idTokenResult = await user.getIdTokenResult();

      const { createOrUpdateUser } = authService;

      createOrUpdateUser(idTokenResult.token)
        .then((res) => {
          dispatch({
            type: "USER_LOGIN_DETAILS",
            payload: {
              name: res.data.name,
              email: res.data.email,
              token: idTokenResult.token,
              role: res.data.role,
              _id: res.data._id,
              picture: res.data.picture,
            },
          });
          roleBasedRedirect(res);
          email = '';
          password='';
        })
        .catch(error => console.log(error));

   
      //navigate('/');
    } catch (error) {
      console.log(error);
      toast.error(t('User is not registered'));
      setTimeout(() =>  dispatch({type: "USER_LOGIN_FAIL"}), 6000);
    }

   
  }



  const googleLogin = async () => {
    auth
    .signInWithPopup(googleAuthProvider)
    .then(async (result) => {
      const { user } = result;
      const idTokenResult = await user.getIdTokenResult();

      const { createOrUpdateUser } = authService;

      createOrUpdateUser(idTokenResult.token)
          .then((res) => {
            dispatch({
              type: "USER_LOGIN_DETAILS",
              payload: {
                name: res.data.name,
                email: res.data.email,
                token: idTokenResult.token,
                role: res.data.role,
                _id: res.data._id,
                picture: res.data.picture,
              },
            });
            roleBasedRedirect(res);
          })
          .catch(error => console.log(error));
      //navigate("/");
    })
    .catch((error) => {
      console.log(error);
      toast.error(error.message);
    });
  }



  return (
    <LoginWrapper>
    <Section>
        <img src={Logo} alt="brand-logo" />
        <Form onSubmit={handleSubmit}  fadeText={loading}>
          <div className='google' onClick={googleLogin}>
            <div className="g-button">
              <img className="g-logo" src={google} alt="Google Logo" />
              <p className="g-text">{t("Sign in with Google")}</p>
            </div>
          </div>
          <div>
          {t("or")}
          </div>
          <div>
            <span><MdOutlineAlternateEmail title={t("Email")} /></span>
            <input 
              type="email" 
              name="email"
               placeholder={`${t("Email")}...`} 
              />
          </div>

          <div>
            <span><GiPadlock title={t("Password")} /></span>
            <input 
              type={showPassword ? "text" : "password"} 
              name="password" 
              placeholder={`${t("Password")}...`} 
              onFocus={() => dispatch({type: 'SET_VISIBLE'})} 
            />
            {visible && (
              <p className='password' onClick={togglePassword}>
                {showPassword ? <AiFillEye /> : <AiFillEyeInvisible />}
              </p>
              )}
          </div>

          <Text right={true}><p onClick={() => navigate('/forgot/password')}>{t("Forgot your password?")}</p></Text>
          
          <div>
            <input 
              type="submit" 
              name="Login" 
              value={t("login")} 
              id="submit"
            />
             {loading && (<span className='spinner'>
                <Oval
                    height={25}
                    width={25}
                    color='hsl(0, 0%, 83%)'
                    visible={true}
                    ariaLabel='oval-loading'
                    secondaryColor="#fff"
                    strokeWidth={7}
                    strokeWidthSecondary={7}
                    />
            </span>)}
          </div>

          <Text central={true}>{t("Don't have an account?")} &nbsp; <p onClick={() => navigate(`/${encodeURI(t('register'))}`)}>{t("Sign Up")}</p></Text>
        </Form>
        <div>
          
        </div>
    </Section>
    </LoginWrapper>
  )
}

export default Login