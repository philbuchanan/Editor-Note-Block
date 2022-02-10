<?php

/**
 * Plugin Name: Editor Note
 * Description: Add editor comments that only render within the block editor.
 * Plugin URI: https://github.com/philbuchanan/Editor-Note-Block
 * Version: 1.1.1
 * Update URI: false
 * Requires at least: 5.8
 * Tested up to: 5.9
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

/**
 * Add an admin page to the “Tools” section to display all posts with editor
 * notes in the content.
 */
function pb_add_editor_notes_menu() {
	add_submenu_page(
		'tools.php',
		__('Editor Notes', 'pb'),
		__('Editor Notes', 'pb'),
		'edit_others_posts',
		'pb_editor_notes',
		'pb_render_editor_notes_page'
	);
}
add_action('admin_menu', 'pb_add_editor_notes_menu');

/**
 * Render the settings page
 */
function pb_render_editor_notes_page() {
	if (!current_user_can('edit_others_posts')) {
		wp_die(__('You do not have sufficient permissions to access this page.'));
	} ?>

	<div class="wrap">
		<h2><?php esc_html_e('Editor Notes', 'pb'); ?></h2>
		<p><?php esc_html_e('Posts that contain editor notes.', 'pb'); ?></p>
		<?php $editor_note_posts = new WP_Query(array(
			'post_type' => 'any',
			'post_status' => 'any',
			'posts_per_page' => -1,
			'orderby' => 'modified',
			'order' => 'ASC',
			's' => '<!-- wp:pb/editor-note',
		));
		if ($editor_note_posts->have_posts()) : ?>
			<table class="wp-list-table widefat fixed striped table-view-list">
				<thead>
					<tr>
						<th>
							<?php esc_html_e('Title', 'pb'); ?>
						</th>
						<th>
							<?php esc_html_e('Notes', 'pb'); ?>
						</th>
						<th style="width: 160px;">
							<?php esc_html_e('Post Author', 'pb'); ?>
						</th>
						<th style="width: 130px;">
							<?php esc_html_e('Modified', 'pb'); ?>
						</th>
					</tr>
				</thead>
				<tbody>
					<?php while ($editor_note_posts->have_posts()) : $editor_note_posts->the_post(); ?>
						<tr>
							<td>
								<strong>
									<a class="row-title" href="<?php echo esc_url(get_edit_post_link()); ?>">
										<?php echo get_the_title(); ?>
									</a>
								</strong>
								<div class="row-actions">
									<span class="edit">
										<a href="<?php echo esc_url(get_edit_post_link()); ?>">
											<?php esc_html_e('Edit', 'pb'); ?>
										</a> |
									</span>
									<span class="view">
										<a href="<?php echo esc_url(get_the_permalink()); ?>" rel="bookmark">
											<?php esc_html_e('View', 'pb'); ?>
										</a>
									</span>
								</div>
							</td>
							<td>
								<?php $editor_notes = pb_get_editor_note_blocks(parse_blocks(get_the_content()));

								if (!empty($editor_notes)) {
									foreach($editor_notes as $note) { ?>
										<p><?php echo $note; ?></p>
									<?php }
								} ?>
							</td>
							<td>
								<?php echo esc_html(get_the_author_meta('display_name')); ?>
							</td>
							<td>
								<time
									dateTime="<?php echo esc_attr(get_the_modified_time(DATE_W3C)); ?>"
									title="<?php printf(esc_html_x('%s at %s', '[DATE] at [TIME]', 'pb'),
										get_the_modified_time('Y/m/d'),
										get_the_modified_time('g:i a'),
									); ?>"
								>
									<?php echo esc_html(get_the_modified_time('Y/m/d')); ?>
								</time><br>
								<?php if (get_the_modified_author()) {
									printf(esc_html_x('By %s', 'Name of person who last modified the post', 'pb'), get_the_modified_author());
								} ?>
							</td>
						</tr>
					<?php endwhile; ?>
				</tbody>
			</table>
		<?php else : ?>
			<p><?php esc_html_e('There are no active editor notes.', 'pb'); ?></p>
		<?php endif; wp_reset_postdata(); ?>
	</div>
<?php }

/**
 * Recursive function to search InnerBlocks for editor notes
 */
function pb_get_editor_note_blocks($blocks, $editor_notes = array()) {
	if (is_array($blocks) && !empty($blocks)) {
		foreach($blocks as $block) {
			if ($block['blockName'] == 'pb/editor-note') {
				if (!empty($block['attrs']['content'])) {
					$editor_notes[] = esc_html($block['attrs']['content']);
				}
			}
			else {
				$editor_notes = pb_get_editor_note_blocks($block['innerBlocks'], $editor_notes);
			}
		}
	}

	return $editor_notes;
}
