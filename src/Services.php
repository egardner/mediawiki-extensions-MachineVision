<?php
// phpcs:disable MediaWiki.Commenting.FunctionComment.MissingDocumentationPublic

namespace MediaWiki\Extension\MachineVision;

use MediaWiki\Extension\MachineVision\Handler\Registry;
use MediaWiki\MediaWikiServices;
use MediaWiki\Storage\NameTableStore;

class Services {

	/** @var MediaWikiServices */
	private $services;

	public function __construct( MediaWikiServices $services ) {
		$this->services = $services;
	}

	public function getClient(): Client {
		return $this->services->getService( 'MachineVisionClient' );
	}

	public function getNameTableStore(): NameTableStore {
		return $this->services->getService( 'MachineVisionNameTableStore' );
	}

	public function getRepository(): Repository {
		return $this->services->getService( 'MachineVisionRepository' );
	}

	public function getHandlerRegistry(): Registry {
		return $this->services->getService( 'MachineVisionHandlerRegistry' );
	}

}
