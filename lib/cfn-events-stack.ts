import {
  Stack,
  StackProps,
  aws_sns as sns,
  aws_sns_subscriptions as subscriptions,
  aws_chatbot as chatbot,
  aws_logs as logs,
  aws_events as events,
  aws_events_targets as targets,
} from "aws-cdk-lib";
import { Construct } from "constructs";

interface CfnEventsStackProps extends StackProps {
  awsChatbotWorkspaceID: string;
  slackChannelID: string;
  slackChannelName: string;
  emailAddress: string;
}

export class CfnEventsStack extends Stack {
  constructor(scope: Construct, id: string, props: CfnEventsStackProps) {
    super(scope, id, props);

    // SNS Topic
    const topic = new sns.Topic(this, "Topic");

    // SNS Email subscription
    topic.addSubscription(
      new subscriptions.EmailSubscription(props.emailAddress)
    );

    // AWS Chatbot
    new chatbot.SlackChannelConfiguration(this, "Slack Channel", {
      slackChannelConfigurationName: props.slackChannelName,
      slackWorkspaceId: props.awsChatbotWorkspaceID,
      slackChannelId: props.slackChannelID,
      logRetention: logs.RetentionDays.TWO_WEEKS,
      loggingLevel: chatbot.LoggingLevel.INFO,
      notificationTopics: [topic],
    });

    // EventBridge Rule
    const cfnStackStatusChangeRule = new events.Rule(
      this,
      "CloudFormation Stack Status Change Rule",
      {
        eventPattern: {
          source: ["aws.cloudformation"],
          detailType: ["CloudFormation Stack Status Change"],
        },
      }
    );
    const cfnResourceStatusChangeRule = new events.Rule(
      this,
      "CloudFormation Resource Status Change Rule",
      {
        eventPattern: {
          source: ["aws.cloudformation"],
          detailType: ["CloudFormation Resource Status Change"],
        },
      }
    );
    const cfnDriftDetectionStatusChangeRule = new events.Rule(
      this,
      "CloudFormation Drift Detection Status Change Rule",
      {
        eventPattern: {
          source: ["aws.cloudformation"],
          detailType: ["CloudFormation Drift Detection Status Change"],
        },
      }
    );

    // EventBridge Rule target
    cfnStackStatusChangeRule.addTarget(new targets.SnsTopic(topic));
    cfnResourceStatusChangeRule.addTarget(new targets.SnsTopic(topic));
    cfnDriftDetectionStatusChangeRule.addTarget(new targets.SnsTopic(topic));
  }
}
