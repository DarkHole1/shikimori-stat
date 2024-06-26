import fetch from "node-fetch";

export default async (userId: number, first: boolean) => {
  const result = [];
  let json = [];
  let page = first ? 1 : 2;

  const year = new Date();
  year.setFullYear(year.getFullYear() - 1);
  do {
    const response = await fetch(
      `https://shikimori.one/api/users/${userId}/history?limit=100&page=${page}`,
      {
        headers: { "User-Agent": "shikimori-stat" }
      }
    );

    json = (await response.json()) as any[];

    result.push(...json);
    page += 1;
  } while (
    !first &&
    json.length >= 100 &&
    new Date(result[result.length - 1].created_at) > year
  );
  return result;
};
