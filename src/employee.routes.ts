import * as express from "express";
import { Request, Response } from 'express';
import { ObjectId } from "mongodb";
import { collections } from "./database";

export const employeeRouter = express.Router();
employeeRouter.use(express.json());

employeeRouter.get("/", async (_req, res) => {
    try {
        const employees = await collections?.employees?.find({}).toArray();
        res.status(200).send(employees);
    } catch (error) {
        res.status(500).send(error instanceof Error ? error.message : "Unknown error");
    }
});

employeeRouter.get("/:id", async (req, res) => {
    try {
        const id = req?.params?.id;
        const query = { _id: new ObjectId(id) };
        const employee = await collections?.employees?.findOne(query);

        if (employee) {
            res.status(200).send(employee);
        } else {
            res.status(404).send(`Failed to find an employee: ID ${id}`);
        }
    } catch (error) {
        res.status(404).send(`Failed to find an employee: ID ${req?.params?.id}`);
    }
});

employeeRouter.post("/", async (req, res) => {
    try {
        const employee = req.body;
        const result = await collections?.employees?.insertOne(employee);

        if (result?.acknowledged) {
            res.status(201).send(`Created a new employee: ID ${result.insertedId}.`);
        } else {
            res.status(500).send("Failed to create a new employee.");
        }
    } catch (error) {
        console.error(error);
        res.status(400).send(error instanceof Error ? error.message : "Unknown error");
    }
});

employeeRouter.put("/:id", async (req, res) => {
    try {
        const id = req?.params?.id;
        const employee = req.body;
        const query = { _id: new ObjectId(id) };
        const result = await collections?.employees?.updateOne(query, { $set: employee });

        if (result && result.matchedCount) {
            res.status(200).send(`Updated an employee: ID ${id}.`);
        } else if (!result?.matchedCount) {
            res.status(404).send(`Failed to find an employee: ID ${id}`);
        } else {
            res.status(304).send(`Failed to update an employee: ID ${id}`);
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(message);
        res.status(400).send(message);
    }
});

employeeRouter.delete("/:id", async (req, res) => {
    try {
        const id = req?.params?.id;
        const query = { _id: new ObjectId(id) };
        const result = await collections?.employees?.deleteOne(query);

        if (result && result.deletedCount) {
            res.status(202).send(`Removed an employee: ID ${id}`);
        } else if (!result) {
            res.status(400).send(`Failed to remove an employee: ID ${id}`);
        } else if (!result.deletedCount) {
            res.status(404).send(`Failed to find an employee: ID ${id}`);
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(message);
        res.status(400).send(message);
    }
});

//post of search on endpoint /search
employeeRouter.post("/search/", async (req: Request, res: Response) => {
    try {
        const query: any = req.body; // Use any if req.body structure is not known beforehand
        let mongoQuery: any[] = [
            {
                $search: {
                    index: "employeeSearch",
                    text: {
                        query: query.query,
                        path: "name"
                    }
                }
            }
        ];

        if (query.seniority && query.seniority.length > 0) {
            mongoQuery.push({
                $match: {
                    level: { $in: query.seniority }
                }
            } as any); // Use 'as any' to bypass type checking for $match
        }

        const employees = await collections?.employees?.aggregate(mongoQuery).toArray();

        if (employees) {
            res.status(200).send(employees);
        } else {
            res.status(404).send(`Failed to find employees with query: ${query}`);
        }
    } catch (error) {
        res.status(500).send(`Failed to find employees`);
    }
});