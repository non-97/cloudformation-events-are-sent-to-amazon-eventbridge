#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { CfnEventsStack } from "../lib/cfn-events-stack";
import "dotenv/config";

const app = new cdk.App();

// If the variable specified by dotenv is not defined, the process is aborted
if (
  process.env.AWS_CHATBOT_WORKSPACE_ID === undefined ||
  process.env.SLACK_CHANNEL_ID === undefined ||
  process.env.SLACK_CHANNEL_NAME === undefined ||
  process.env.EMAIL_ADDRESS === undefined
) {
  console.error(`
    There is not enough input in the .env file.
    Please enter a value in the .env file.`);
  process.exit(1);
}

const awsChatbotWorkspaceID = process.env.AWS_CHATBOT_WORKSPACE_ID;
const slackChannelID = process.env.SLACK_CHANNEL_ID;
const slackChannelName = process.env.SLACK_CHANNEL_NAME;
const emailAddress = process.env.EMAIL_ADDRESS;

new CfnEventsStack(app, "CfnEventsStack", {
  awsChatbotWorkspaceID,
  slackChannelID,
  slackChannelName,
  emailAddress,
});
