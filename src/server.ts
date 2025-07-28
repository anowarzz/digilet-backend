import app from "./app";

async function main() {
  try {
    app.listen(5000, () => {
      console.log(`Development Server Running On Port 5000`);
    });
  } catch (error) {
    console.log(error);
  }
}


main()