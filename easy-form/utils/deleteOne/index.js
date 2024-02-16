import serverPath from '../../utils/serverPath';
export default async (routerPath, id) =>
{
  try {
    const response = await fetch(serverPath(`/${routerPath}`), {
      method: "DELETE",
      headers: {
        "Content-Type": "Application/json"
      },
      body: JSON.stringify({id})
    })
    return (await response.json());
  } catch (error) {
    return {
      status: "failure",
      message: error.message
    }
  }
}