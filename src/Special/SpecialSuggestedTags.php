<?php

namespace MediaWiki\Extension\MachineVision\Special;

use LocalRepo;
use MediaWiki\Extension\MachineVision\Handler\LabelResolver;
use MediaWiki\Extension\MachineVision\Repository;
use MediaWiki\Extension\MachineVision\Services;
use MediaWiki\MediaWikiServices;
use SpecialPage;
use Title;

class SpecialSuggestedTags extends SpecialPage {

	/** @var LocalRepo */
	private $fileRepo;

	/** @var Repository */
	private $labelRepo;

	/** @var LabelResolver */
	private $labelResolver;

	/** @inheritDoc */
	public function __construct( $name = 'SuggestedTags' ) {
		parent::__construct( $name, $this->testersOnly() ? 'imagelabel-test' : '' );
		$extensionServices = new Services( MediaWikiServices::getInstance() );
		$this->fileRepo = $extensionServices->getRepoGroup()->getLocalRepo();
		$this->labelRepo = $extensionServices->getRepository();
		$this->labelResolver = $extensionServices->getLabelResolver();
	}

	/** @inheritDoc */
	public function execute( $par ) {
		$this->checkPermissions();
		$this->setHeaders();

		// no-JS fallback
		$out = $this->getOutput();
		$out->addHTML( '<div class="machinevision-client-nojs">' );
		$out->addHTML( '<p class="warningbox">' .
			$this->msg( 'machinevision-javascript-required' )->parse() . '</p>' );
		$out->addHTML( '</div>' );
		$out->addModuleStyles( 'ext.MachineVision.init' );

		$initialData = $this->getInitialSuggestedTagsData();
		if ( $initialData ) {
			$this->getOutput()->addJsConfigVars( 'wgMVSuggestedTagsInitialData', $initialData );
		}

		// Generate login message with link with returnto URL query parameter.
		$loginMessage = wfMessage( 'machinevision-login-message' )->parse();
		$this->getOutput()->addJsConfigVars( 'wgMVSuggestedTagsLoginMessage', $loginMessage );

		$this->getOutput()->addModules( 'ext.MachineVision' );
	}

	/** @inheritDoc */
	public function getDescription() {
		return $this->msg( 'machinevision-machineaidedtagging' )->parse();
	}

	/**
	 * Optimistically get some label data for images not specifically uploaded by the current user,
	 * to be retrieved by the JS frontend on load.
	 * @return array
	 */
	private function getInitialSuggestedTagsData() {
		$result = [];
		$rawTitles = $this->labelRepo->getTitlesWithUnreviewedLabels( 10 );

		foreach ( $rawTitles as $rawTitle ) {
			$title = Title::newFromText( $rawTitle, NS_FILE );
			$file = $this->fileRepo->findFile( $title );
			$thumbUrl = $file->transform( [ 'width' => 800, 'height' => 640 ] )->getUrl();

			$labelData = $this->labelRepo->getLabels( $file->getSha1() );
			$unreviewedLabelData = array_filter( $labelData, function ( array $data ) {
				return $data['review'] === Repository::REVIEW_UNREVIEWED;
			} );

			if ( !$unreviewedLabelData ) {
				continue;
			}

			$labels = $this->labelResolver->resolve(
				$this->getContext(),
				array_column(
					$unreviewedLabelData,
					'wikidata_id'
				)
			);

			if ( !$labels ) {
				continue;
			}

			$suggestedLabels = [];
			foreach ( $labels as $id => $label ) {
				$suggestedLabels[] = [
					'wikidata_id' => $id,
					'label' => $label,
				];
			}

			$result[] = [
				'title' => $title->getPrefixedDBkey(),
				'pageid' => $title->getArticleID(),
				'description_url' => $file->getDescriptionUrl(),
				'thumb_url' => $thumbUrl,
				'height' => $file->getHeight(),
				'width' => $file->getWidth(),
				'suggested_labels' => $suggestedLabels,
			];
		}
		return $result;
	}

	private function testersOnly() {
		$extensionServices = new Services( MediaWikiServices::getInstance() );
		return $extensionServices->getExtensionConfig()->get( 'MachineVisionTestersOnly' );
	}
}
