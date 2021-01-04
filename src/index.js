const express = require("express");
const { Sequelize, DataTypes } = require("sequelize");

const connString =
  "postgres_connection_uri";
const db = new Sequelize(connString, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // <<<<<<< YOU NEED THIS
    },
  },
});

const Survey = db.define("survey", {
  surveyId: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
  },
});

const Question = db.define("question", {
  surveyId: {
    type: DataTypes.UUID,
    references: {
      // This is a reference to another model
      model: Survey,

      // This is the column name of the referenced model
      key: "surveyId",
    },
  },
  question: {
    type: DataTypes.STRING,
  },
  qId: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
});

Survey.hasMany(Question, {
  foreignKey: "surveyId",
});
Question.belongsTo(Survey, {
  foreignKey: "surveyId",
});

const app = express();
app.use(express.json());

app.post("/survey/create", async (req, res) => {
  const newSurvey = await Survey.create({
    isPublished: req.body.isPublished,
  });
  //   console.log(newSurvey);
  res.send(newSurvey);
});

app.post("/question/create", async (req, res) => {
  const newQuestion = await Question.create({
    question: req.body.question,
    surveyId: req.body.surveyId,
  });
  //   console.log(newSurvey);
  res.send(newQuestion);
});

app.get("/survey/list", async (req, res) => {
  const allSurveys = await Survey.findAll({ include: Question });
  res.send(allSurveys);
});

app.get("/survey/list/unpublished", async (req, res) => {
  const allSurveys = await Survey.findAll({
    where: {
      isPublished: false,
    },
  });
  res.send(allSurveys);
});

db.sync()
  .then(() => {
    console.log("Database sync happened, starting server");
    app.listen(9999);
  })
  .catch((e) => {
    console.error("Failed to sync database", e);
  });
