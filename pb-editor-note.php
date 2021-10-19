<?php

/**
 * Plugin Name: Editor Note
 * Description: Add editor comments that only render within the block editor.
 * Plugin URI: https://github.com/philbuchanan/Editor-Note-Block
 * Version: 1.0.1
 * Requires at least: 5.8
 * Tested up to: 5.8
 * Requires PHP: 7.3
 * Author: Phil Buchanan
 * Author URI: https://philbuchanan.com
 * License: GPLv2 or later
 */

/**
 * Registers the block using the metadata loaded from the block.json file. It
 * also registers the editor CSS and JavaScript assets so they can be enqueued
 * through the block editor in the corresponding context.
 */
function pb_editor_note_block_init() {
	register_block_type_from_metadata(__DIR__);
}
add_action('init', 'pb_editor_note_block_init');
