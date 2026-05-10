import joplin from 'api';
import { ToolbarButtonLocation } from 'api/types';
import * as moment from 'moment';


/**
 * createMetadataMarkdownTable
 */
const createMetadataMarkdownTable = (note: any, dateFormat: string, timeFormat: string) : string => {

	const {
		id
		,user_updated_time
		,updated_time
		,user_created_time
		,created_time
		,latitude
		,longitude
		,altitude
	} = note;

	const updateDateTime = user_updated_time ?? updated_time;
	const createDateTime = user_created_time ?? created_time;


return `<!-- metadata table ${moment().format(dateFormat)} ${moment().format(timeFormat)} -->
|Id|${id}|
|---|---|
|Modified|${moment(updateDateTime).format(dateFormat)} ${moment(updateDateTime).format(timeFormat)}|
|Created|${moment(createDateTime).format(dateFormat)} ${moment(createDateTime).format(timeFormat)}|
`+
(latitude > 0 ? 	`\n|Latitude|${latitude}&deg;|` 		: ``) +
(longitude > 0 ? 	`\n|Longitude|${longitude}&deg;|` 		: ``) +
(altitude > 0 ? 	`\n|Altitude|${altitude}|` 				: ``) +
`<!-- ./metadata table -->`;
}




joplin.plugins.register({
	onStart: async function() {

		const dateFormat: string = await joplin.settings.globalValue('dateFormat');
		const timeFormat: string = await joplin.settings.globalValue('timeFormat');

		/**
		* getMetadataMarkdown
		*/
		const getMetadataMarkdown = async () : Promise<string> => {
			//get selected note
			const note = await joplin.workspace.selectedNote();
			if (!note) {
				console.info('No note is selected');
				return null;
			}
			const mdTable = createMetadataMarkdownTable(note, dateFormat, timeFormat);

			console.log('note',note, mdTable);

			return mdTable
		}


		/**
		 * register
		 */
		await joplin.commands.register({
			name: 'insertMetadata',
			label: 'Insert Metadata',
			iconName: 'fas fa-file-code',
			execute: async () => {
				const mdTable = await getMetadataMarkdown();
				if(!mdTable){return;}
				await joplin.commands.execute("insertText", mdTable);
				await joplin.commands.execute('editor.focus');
			},
		});

		//add to toolbar
		await joplin.views.toolbarButtons.create('insertMetadata', 'insertMetadata', ToolbarButtonLocation.EditorToolbar);
	}

});
