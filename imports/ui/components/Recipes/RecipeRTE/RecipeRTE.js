import React from 'react';
import PropTypes from 'prop-types';
import RichTextEditor, { EditorValue } from 'react-rte';
import { convertToRaw, convertFromRaw, EditorState } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import { stateFromHTML } from 'draft-js-import-html';

export default class RecipeRTE extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.initialize(this.props.description, true);

    this.initialize = this.initialize.bind(this);
    this.onRichTextEditorChange = this.onRichTextEditorChange.bind(this);
  }

  onRichTextEditorChange(value) {
    // let editorState = value.getEditorState();
    // let contentState = editorState.getCurrentContent();
    this.props.rteValueUpdate(stateToHTML(value.getEditorState().getCurrentContent()));
    this.setState({ value });
  }

  initialize(description) {
    let editorValue;
    if (description) {
      // const contentState = convertFromRaw(description);
      // const editorState = EditorState.createWithContent(contentState);
      // editorValue = new EditorValue(editorState);

      editorValue = EditorValue.createFromState(EditorState.createWithContent(stateFromHTML(description)));
    }

    this.state = {
      value: (editorValue) || RichTextEditor.createEmptyValue(),
    };

    this.richTextEditorToolbar = {
    // The toolbarConfig object allows you to specify custom buttons, reorder buttons and to add custom css classes.
    // Supported inline styles: https://github.com/facebook/draft-js/blob/master/docs/Advanced-Topics-Inline-Styles.md
    // Supported block types: https://github.com/facebook/draft-js/blob/master/docs/Advanced-Topics-Custom-Block-Render.md#draft-default-block-render-map

      // Optionally specify the groups to display (displayed in the order listed).
      display: ['INLINE_STYLE_BUTTONS', 'BLOCK_TYPE_BUTTONS', /* 'LINK_BUTTONS', 'BLOCK_TYPE_DROPDOWN', */ 'HISTORY_BUTTONS'],
      INLINE_STYLE_BUTTONS: [
        { label: 'Bold', style: 'BOLD', className: 'custom-css-class' },
        { label: 'Italic', style: 'ITALIC' },
        { label: 'Underline', style: 'UNDERLINE' },
      ],
      BLOCK_TYPE_DROPDOWN: [
        { label: 'Normal', style: 'unstyled' },
        { label: 'Heading Large', style: 'header-one' },
        { label: 'Heading Medium', style: 'header-two' },
        { label: 'Heading Small', style: 'header-three' },
      ],
      BLOCK_TYPE_BUTTONS: [
        { label: 'List', style: 'unordered-list-item' },
        { label: 'Numbered List', style: 'ordered-list-item' },
      ],

    };
  }

  render() {
    return (
      <RichTextEditor
        className="richTextEditor"
        value={this.state.value}
        onChange={this.onRichTextEditorChange}
        toolbarConfig={this.richTextEditorToolbar}
        placeholder="Type Instructions here"
      />
    );
  }
}
