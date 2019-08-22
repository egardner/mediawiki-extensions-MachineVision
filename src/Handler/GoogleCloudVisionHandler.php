<?php

namespace MediaWiki\Extension\MachineVision\Handler;

use Google\Cloud\Vision\V1\ImageAnnotatorClient;
use LocalFile;
use MediaWiki\Extension\MachineVision\Repository;
use RepoGroup;

class GoogleCloudVisionHandler extends WikidataIdHandler {

	/** @var ImageAnnotatorClient */
	// @phan-suppress-next-line PhanUndeclaredTypeProperty
	private $client;

	/** @var RepoGroup */
	private $repoGroup;

	/** @var bool */
	private $sendFileContents;

	/**
	 * @param ImageAnnotatorClient $client
	 * @param Repository $repository
	 * @param RepoGroup $repoGroup
	 * @param LabelResolver $labelResolver
	 * @param bool $sendFileContents
	 * @suppress PhanUndeclaredTypeParameter
	 */
	public function __construct(
		ImageAnnotatorClient $client,
		Repository $repository,
		RepoGroup $repoGroup,
		LabelResolver $labelResolver,
		$sendFileContents
	) {
		parent::__construct( $repository, $labelResolver );
		$this->client = $client;
		$this->repoGroup = $repoGroup;
		$this->sendFileContents = $sendFileContents;
	}

	/**
	 * Handle a new upload, after the core handling has been completed.
	 * Retrieves machine vision metadata about the image and stores it.
	 * @param string $provider provider name
	 * @param LocalFile $file
	 * @throws \Google\ApiCore\ApiException
	 * @suppress PhanUndeclaredTypeThrowsType,PhanUndeclaredClassMethod
	 */
	public function handleUploadComplete( $provider, LocalFile $file ) {
		$payload = $this->sendFileContents ? $this->getContents( $file ) : $this->getUrl( $file );
		$labels = $this->client->labelDetection( $payload )->getLabelAnnotations();
		$wikidataIds = [];
		foreach ( $labels as $label ) {
			$freebaseId = $label->getMid();
			$mappedWikidataIds = $this->getRepository()->getMappedWikidataIds( $freebaseId );
			if ( $mappedWikidataIds ) {
				$wikidataIds = array_merge( $wikidataIds, $mappedWikidataIds );
			}
		}
		$this->getRepository()->insertLabels( $file->getSha1(), $provider, $wikidataIds );
	}

	private function getUrl( LocalFile $file ) {
		return wfExpandUrl( $file->getFullUrl(), PROTO_HTTPS );
	}

	private function getContents( LocalFile $file ) {
		$fileBackend = $this->repoGroup->getLocalRepo()->getBackend();
		return $fileBackend->getFileContents( [ 'src' => $file->getPath() ] );
	}

}
