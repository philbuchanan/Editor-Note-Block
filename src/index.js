/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Fragment } from '@wordpress/element';
import { registerBlockType, createBlock } from '@wordpress/blocks';
import {
	BlockControls,
	RichText,
	useBlockProps,
} from '@wordpress/block-editor';
import {
	Path,
	SVG,
	ToolbarGroup,
	ToolbarButton,
} from '@wordpress/components';
import { dispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import './index.scss';

registerBlockType('pb/editor-note', {
	icon: <SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
		<Path d="M20,5.78a1.5,1.5,0,0,0-1.5-1.5H5.5A1.5,1.5,0,0,0,4,5.78V18.72a1,1,0,0,0,1.71.7l4.2-4.2A1.5,1.5,0,0,1,11,14.78H18.5a1.5,1.5,0,0,0,1.5-1.5Zm-2.31,7.5H10.35a1.5,1.5,0,0,0-1.06.44L5.93,17.08a.25.25,0,0,1-.43-.17V6.53a.78.78,0,0,1,.81-.75H17.69a.78.78,0,0,1,.81.75v6A.78.78,0,0,1,17.69,13.28Z"/>
	</SVG>,

	merge: (attributes, attributesToMerge) => {
		return {
			content: (attributes.content || '') + (attributesToMerge.content || ''),
		};
	},

	edit: ({
		attributes,
		setAttributes,
		clientId,
		mergeBlocks,
		onReplace,
		onRemove,
	}) => {
		return (
			<Fragment>
				<BlockControls
					group="other"
				>
					<ToolbarGroup>
						<ToolbarButton
							className="wp-block-pb-editor-note__resolve"
							label={ __('Resolve this comment', 'pb') }
							onClick={ () => {
								dispatch('core/block-editor').removeBlock(clientId);
							} }
							icon={
								<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
									<Path d="m12 4c-1.5823 0-3.12899.46919-4.44457 1.34824-1.31559.87904-2.34097 2.12847-2.94647 3.59027-.60549 1.46179-.76392 3.07029-.45524 4.62219.30868 1.5518 1.0706 2.9773 2.18942 4.0961 1.11881 1.1188 2.54427 1.8807 4.09616 2.1894 1.5518.3087 3.1603.1503 4.6221-.4552s2.7112-1.6309 3.5903-2.9465c.879-1.3156 1.3482-2.8623 1.3482-4.4445 0-2.12176-.8428-4.15658-2.3431-5.65686-1.5003-1.50029-3.5351-2.34314-5.6568-2.34314zm0 14.5454c-1.2946 0-2.56009-.3839-3.63648-1.1031s-1.91533-1.7415-2.41074-2.9375c-.4954-1.196-.62503-2.5121-.37247-3.7818.25256-1.26967.87595-2.43596 1.79134-3.35135.9154-.91539 2.08168-1.53879 3.35135-1.79134 1.2697-.25256 2.5858-.12294 3.7818.37247s2.2183 1.33435 2.9375 2.41074 1.1031 2.34188 1.1031 3.63648c0 1.7359-.6896 3.4008-1.9171 4.6283s-2.8924 1.9171-4.6283 1.9171z"/>
									<Path d="m14.3927 9.30179-3.8473 3.85451-1.66542-1.6727c-.13913-.1191-.31809-.1814-.50113-.1743-.18303.007-.35666.0829-.48618.2124-.12953.1296-.2054.3032-.21247.4862-.00707.1831.05519.362.17433.5012l2.18177 2.1818c.1363.1354.3206.2114.5128.2114.1921 0 .3764-.076.5127-.2114l4.3636-4.3637c.1192-.1391.1814-.318.1743-.50108-.007-.18304-.0829-.35667-.2124-.48619-.1296-.12952-.3032-.2054-.4862-.21247-.1831-.00707-.362.05519-.5011.17433z"/>
								</SVG>
							}
						>
							{ __('Resolve', 'pb') }
						</ToolbarButton>
					</ToolbarGroup>
				</BlockControls>
				<RichText
					{ ...useBlockProps() }
					identifier="content"
					tagName="p"
					placeholder={ __('Editor note text', 'pb') }
					value={ attributes.content }
					multiline={ false }
					onChange={ (content) => setAttributes({content}) }
					onSplit={ (value, isOriginal) => {
						let name = 'core/paragraph';
						let newAttributes;

						if (isOriginal || value) {
							name = 'pb/editor-note';
							newAttributes = {
								...attributes,
								content: value,
							};
						};

						const block = createBlock(name, newAttributes);

						if (isOriginal) {
							block.clientId = clientId;
						}

						return block;
					} }
					onReplace={ onReplace }
					onRemove={ onRemove }
					onMerge={ mergeBlocks }
					aria-label={ attributes.content
						? __('Editor comment', 'pb')
						: __('Empty block; start writing to add an editor note', 'pb')
					}
					data-empty={ attributes.content ? false : true }
					allowedFormats={ [] }
					__unstableAllowPrefixTransformations={ true }
				/>
			</Fragment>
		);
	},

	transforms: {
		from: [
			{
				type: 'block',
				blocks: ['core/paragraph'],
				transform: (attributes) => {
					return createBlock('pb/editor-note', {
						content: attributes.content
					});
				},
			},
			{
				type: 'block',
				blocks: ['core/heading'],
				transform: (attributes) => {
					return createBlock('pb/editor-note', {
						content: attributes.content
					});
				},
			},
			{
				type: 'enter',
				regExp: /^%%$/,
				transform: () => createBlock('pb/editor-note'),
			},
			{
				type: 'prefix',
				prefix: '%%',
				transform: (content) => (
					createBlock('pb/editor-note', {
						content: content,
					})
				),
			},
		],
		to: [
			{
				type: 'block',
				blocks: ['core/paragraph'],
				transform: (attributes, innerBlocks) => (
					createBlock('core/paragraph', {
						content: attributes.content,
					})
				),
			},
			{
				type: 'block',
				blocks: ['core/heading'],
				transform: (attributes, innerBlocks) => (
					createBlock('core/heading', {
						content: attributes.content,
					})
				),
			},
		],
	},

	save: () => null,
});
