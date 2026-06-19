"use server";

export async function fetchGuildsAction() {
  try {
    const API_REQ = await fetch(`${process.env.API_URL}/fetchGuilds`);
    const data = await API_REQ.json();
    return { data };
  } catch (err) {
    console.log("An error occured while trying to fetch data");
    console.log(err);
    return { responseCode: 500 };
  }
}
