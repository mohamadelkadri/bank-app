import axios from "axios";
import { createContext, useReducer } from "react";
import {
  LOGIN_FAILED,
  LOGIN_SUCCESS,
  FETCH_PROFILE_FAILED,
  FETCH_PROFILE_SUCCES,
  LOGOUT,
  REGISTER_SUCCESS,
  REGISTER_FAIL,
} from "./authActionTypes";
import { API_URL_USER } from "../../../utils/apiURL";

// auth context
export const authContext = createContext();

// initial state
const INITIAL_STATE = {
  userAuth: JSON.parse(localStorage.getItem("userAuth")),
  error: null,
  loading: false,
  profile: null,
};

// AuthReducer: to update the initial state
const reducer = (state, action) => {
  const { type, payload } = action;
  switch (type) {
    case LOGIN_SUCCESS:
      // add user to storage
      localStorage.setItem("userAuth", JSON.stringify(payload));
      return { ...state, payload: false, error: null, userAuth: payload };
    case LOGIN_FAILED:
      return {
        ...state,
        error: payload,
        loading: false,
        userAuth: null,
      };

    // register
    case REGISTER_SUCCESS:
      // add user to storage
      localStorage.setItem("userAuth", JSON.stringify(payload));
      return { ...state, payload: false, error: null, userAuth: payload };
    case REGISTER_FAIL:
      return {
        ...state,
        error: payload,
        loading: false,
        userAuth: null,
      };
    // profile
    case FETCH_PROFILE_SUCCES:
      return { ...state, loading: false, error: null, profile: payload };
    case FETCH_PROFILE_FAILED:
      return { ...state, loading: false, error: payload, profile: null };
    case LOGOUT:
      // remove user from localstorage
      localStorage.removeItem("userAuth");
      return { ...state, loading: false, error: null, userAuth: null };
    default:
      return state;
  }
};

// Provider: take a component that need to access data from this context
// dispatch is used to update the state that was initially INITIAL STATE
// useReducer is used to link the backend
const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  //   login action
  const loginUserAction = async (formData) => {
    // formData est le body, le payload
    const config = {
      Headers: {
        "Content-Type": "application/json",
      },
    };
    try {
      const res = await axios.post(`${API_URL_USER}/login/`, formData, config);
      if (res?.data?.status === "success") {
        dispatch({
          type: LOGIN_SUCCESS, //for the action.type in reducer
          payload: res.data,
        });
      }
      // redirect
      window.location.href = "/dashboard";
    } catch (error) {
      dispatch({
        type: LOGIN_FAILED, //for the action.type in reducer
        payload: error?.response?.data?.message,
      });
    }
  };

  //   register action
  const registerUserAction = async (formData) => {
    // formData est le body, le payload
    const config = {
      Headers: {
        "Content-Type": "application/json",
      },
    };
    try {
      const res = await axios.post(
        `${API_URL_USER}/register/`,
        formData,
        config
      );
      if (res?.data?.status === "success") {
        dispatch({
          type: REGISTER_SUCCESS, //for the action.type in reducer
          payload: res.data,
        });
      }
      // redirect
      window.location.href = "/dashboard";
    } catch (error) {
      dispatch({
        type: REGISTER_FAIL, //for the action.type in reducer
        payload: error?.response?.data?.message,
      });
    }
  };

  // profile action
  const fetchProfileAction = async () => {
    try {
      const config = {
        headers: {
          "content-Type": "application/json",
          authorization: `Bearer ${state?.userAuth?.token}`,
        },
      };
      const res = await axios.get(`${API_URL_USER}/profile`, config);
      if (res?.data?.status === "success") {
        dispatch({
          type: FETCH_PROFILE_SUCCES,
          payload: res.data,
        });
      }
    } catch (error) {
      dispatch({
        type: FETCH_PROFILE_FAILED,
        payload: error?.response?.data?.message,
      });
    }
  };

  // logout action
  const logoutUserAction = () => {
    dispatch({
      type: LOGOUT,
      payload: null,
    });
    // redirect
    window.location.href = "/login";
  };
  return (
    <authContext.Provider
      value={{
        loginUserAction,
        userAuth: state,
        token: state?.userAuth?.token,
        fetchProfileAction,
        profile: state?.profile,
        error: state?.error,
        logoutUserAction,
        registerUserAction,
      }}
    >
      {children}
    </authContext.Provider>
  );
};

export default AuthContextProvider;
