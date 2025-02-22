"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const dna_discord_framework_1 = require("dna-discord-framework");
const discord_js_1 = require("discord.js");
const OrcaBotDataManager_1 = __importDefault(require("../OrcaBotDataManager"));
const OrcaJob_1 = __importDefault(require("../OrcaJob/OrcaJob"));
/**
 * Command that Runs an Orca Calculation on the Device the Bot is hosted by
 */
class Orca extends dna_discord_framework_1.Command {
    constructor() {
        super(...arguments);
        /* <inheritdoc> */
        this.CommandName = "orca";
        /* <inheritdoc> */
        this.CommandDescription = "Runs an Orca Calculation on the Server";
        /* <inheritdoc> */
        this.IsEphemeralResponse = true;
        /* <inheritdoc> */
        this.CommandHandler = dna_discord_framework_1.DefaultCommandHandler.Instance();
        /* <inheritdoc> */
        this.IsCommandBlocking = false;
        /* <inheritdoc> */
        this.Options = [
            {
                type: dna_discord_framework_1.OptionTypesEnum.Attachment,
                name: "inputfile",
                description: "Orca File to Run through Orca",
                required: true,
            },
            {
                type: dna_discord_framework_1.OptionTypesEnum.Attachment,
                name: "xyzfile1",
                description: "Additional XYZ File to Run through Orca",
                required: false,
            },
            {
                type: dna_discord_framework_1.OptionTypesEnum.Attachment,
                name: "xyzfile2",
                description: "Additional XYZ File to Run through Orca",
                required: false,
            },
            {
                type: dna_discord_framework_1.OptionTypesEnum.Attachment,
                name: "xyzfile3",
                description: "Additional XYZ File to Run through Orca",
                required: false,
            },
            {
                type: dna_discord_framework_1.OptionTypesEnum.Attachment,
                name: "xyzfile4",
                description: "Additional XYZ File to Run through Orca",
                required: false,
            },
            {
                type: dna_discord_framework_1.OptionTypesEnum.Attachment,
                name: "xyzfile5",
                description: "Additional XYZ File to Run through Orca",
                required: false,
            },
        ];
        /**
         * The Name of the Job that is currently running
         */
        this.JobName = "";
        /**
         * The Message that will be sent to the Calculation Channel
         */
        this.CalculationMessage = new dna_discord_framework_1.DefaultBotCommunication();
        /* <inheritdoc> */
        this.RunCommand = (client, interaction, BotDataManager) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const dataManager = dna_discord_framework_1.BotData.Instance(OrcaBotDataManager_1.default);
            const inputfile = interaction.options.getAttachment("inputfile");
            const xyzfile1 = interaction.options.getAttachment("xyzfile1");
            const xyzfile2 = interaction.options.getAttachment("xyzfile2");
            const xyzfile3 = interaction.options.getAttachment("xyzfile3");
            const xyzfile4 = interaction.options.getAttachment("xyzfile4");
            const xyzfile5 = interaction.options.getAttachment("xyzfile5");
            this.CalculationMessage = new dna_discord_framework_1.BotMessage(yield client.channels.fetch(dataManager.CALCULATION_CHANNEL_ID));
            this.DiscordCommandUser = interaction.user;
            let author = this.DiscordCommandUser.displayName;
            if (interaction.member && interaction.member instanceof discord_js_1.GuildMember) {
                author = interaction.member.nickname;
            }
            if (!dataManager.IsDiscorcaSetup())
                return this.AddToMessage("Discorca has not been setup yet. Run the /setup Command to Configure Discorca");
            if (!inputfile)
                return this.AddToMessage("Input file was not provided");
            this.AddToMessage(`Preparing Orca Calculation on ${inputfile.name} :atom:`);
            let files = [inputfile, xyzfile1, xyzfile2, xyzfile3, xyzfile4, xyzfile5];
            let orcaJob = new OrcaJob_1.default(inputfile.name, (_a = this.DiscordCommandUser) === null || _a === void 0 ? void 0 : _a.username);
            try {
                yield orcaJob.Setup(files);
                this.AddToMessage(`Files Received`);
                this.CalculationMessage.AddMessage(`Running Orca Calculation on ${inputfile.name} - ${orcaJob.JobAuthor} (${author}) :atom:`);
                dataManager.AddJobArchive(orcaJob);
                dataManager.AddJob(orcaJob);
                if (client.user)
                    client.user.setActivity(`Orca Calculation ${orcaJob.JobName}`, { type: discord_js_1.ActivityType.Playing });
                this.AddToMessage(`Discorca will start the Orca Calculation :hourglass_flowing_sand:`);
                orcaJob.UpdateOutputFile(this.CalculationMessage);
                yield orcaJob.RunJob();
                if (!orcaJob.JobSuccess)
                    this.CalculationMessage.AddMessage(`Server has encountered Errors while running the Orca Calculation (${orcaJob.JobElapsedTime()}) :warning:`);
                else
                    this.CalculationMessage.AddMessage(`Server has completed the Orca Calculation (${orcaJob.JobElapsedTime()}) :white_check_mark:`);
                yield orcaJob.SendAllFiles(this.CalculationMessage, dataManager);
                yield orcaJob.PingUser(this.CalculationMessage, this.DiscordCommandUser);
                dataManager.RemoveJob(orcaJob);
                dataManager.QueueNextActivity(client);
            }
            catch (e) {
                try {
                    if (orcaJob) {
                        this.CalculationMessage.AddMessage("An Error Occured. Terminating Orca Job.\nCheck the Output File for Errors.");
                        dataManager.RemoveJob(orcaJob);
                        orcaJob.PingUser(this.CalculationMessage, this.DiscordCommandUser);
                    }
                    if (e instanceof Error)
                        dataManager.AddErrorLog(e);
                    dataManager.QueueNextActivity(client);
                }
                catch (j) {
                    if (j instanceof Error)
                        dataManager.AddErrorLog(j);
                }
            }
        });
    }
}
module.exports = Orca;
