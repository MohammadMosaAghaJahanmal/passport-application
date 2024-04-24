import serverPath from "../serverPath";

const fetchApi = async({path, method, body}) => fetch(await serverPath(path), {
  method: method,
  credentials: "include",
  headers: {
    Accept: "Application/json",
    "Content-Type": "Application/json",
    "Access-Control-Allow-Credentials": true
  },
  body: JSON.stringify(body)
});

export default fetchApi;