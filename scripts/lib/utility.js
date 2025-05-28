import { Point, PointFactory, AngleTypes } from "./point.js"
import { Path } from "./pathManager.js"

export class FTPUtility
{
	constructor (data_)
	{
		this._path = data_?.path;
		this._token = data_?.token;
		this._tokenDoc = data_?.token?.document;
		this.collisionConfig = data_?.collisionConfig ? data_.collisionConfig
							      : this.defaultCollisionConfig ();
		this._name = data_?.name ? data_.name : this.defaultName ();
		canvas.grid.addHighlightLayer(this._name);
	}

	defaultCollisionConfig () { return { checkCollision: true, whitelist: new Array () }; }
	defaultName () { return "FTPUtility"; }

	clearHighlights () { canvas.grid.highlightLayers[this._name]?.clear (); }

	collision (newSegment_, collisionConfig_ = this.collisionConfig)
	{
		if (! collisionConfig_.checkCollision)
			return false;
	
		const pf = new PointFactory (newSegment_.metric);

		// Make a copy of the array
		let whitelist = new Array ();

		if (this.tokenDoc)
			whitelist.push (this.tokenDoc.id)
		for (let id of collisionConfig_.whitelist)
			whitelist.push (id);

		const checkForToken = (id_, whitelist_) => {
			for (let tokenId of whitelist_)
				if (id_ === tokenId)
					return true;

			return false;
		};

		for (let token of canvas.tokens.placeables)
		{
			if (checkForToken (token.document.id, whitelist))
				continue;

			const tokenSegment = pf.segmentFromToken (token);

			for (let point of tokenSegment.pointSet)
				if (newSegment_.contains (point))
					return true;
		}
	
		return false;
	}

	// Checks if a token could be moved from oldSegment_ to newSegment_
	isTraversable (oldSegment_, newSegment_, collisionConfig_ = this.collisionConfig)
	{
		return ! this.collision (newSegment_, collisionConfig_) && this.los (oldSegment_, newSegment_);
	}
	
	/*
		@points_ An Array of Point objects
	*/
	highlightPoints (points_, config_ = { "data": {}, "retain": false })
	{
		if (! config_.retain)
			this.clearHighlights ();

		let pointOverlap = new Map ();

		points_.forEach (p => {
			if (! p.isValid)
				return;

			if (! pointOverlap.has (p))
				pointOverlap.set (p, 1);
			else
				pointOverlap.set (p, pointOverlap.get (p) + 1);
		});

		for (let point of pointOverlap.keys ())
			canvas.grid.highlightPosition(this._name, { x: point.px, y: point.py });
	}
	highlightSegments (segs_, config_ = { "data": {} })
	{
		let uniquePoints = new Map ();
		let points = new Array ();

		for (let seg of segs_)
		{
			if (uniquePoints.has (seg.id))
				continue;

			uniquePoints.set (seg.id, 1);
			for (let point of seg.pointSet)
				points.push (point);
		}

		return this.highlightPoints (points, config_);
	}

	// Assumes that oldSegment_ and newSegment_ have the same dimensions!
	los (oldSegment_, newSegment_)
	{
		if (! oldSegment_ || oldSegment_.equals (newSegment_)) 
			return true;
	
		if (! newSegment_)
			return false;
	
		if (oldSegment_.width !== newSegment_.width || oldSegment_.height !== newSegment_.height)
		{
			console.log ("FindThePath | Invalid LoS comparison between Points of mismatching dimension");
			return false;
		}

		if (! oldSegment_.isValid || ! newSegment_.isValid)
			return false;

		const ps1 = oldSegment_.pointSet;
		const ps2 = newSegment_.pointSet;

		// A token may take up multiple tiles, and it moves by translation from an old set to a new set. A movement is valid if, for each translation, the old tile has line of sight on the new tile and each tile in the new set has los on every other tile in the set.
		for (let i = 0; i < oldSegment_.width * oldSegment_.height; ++i)
		{		
			if (CONFIG.Canvas.polygonBackends.sight.testCollision(
			    { x: ps1[i].cpx, y: ps1[i].cpy },
			    { x: ps2[i].cpx, y: ps2[i].cpy },
			    { type: "sight", mode: "any" }
			))
				return false;
	
			const p = { x: ps2[i].cpx, y: ps2[i].cpy };

			// If A has los on B then B has los on A, so we only need to check half of these
			for (let j = i + 1; j < newSegment_.width * newSegment_.height; ++j)
				if (CONFIG.Canvas.polygonBackends.sight.testCollision(
					p,
					{ x: ps2[j].cpx, y: ps2[j].cpy },
					{ type: "sight", mode: "any" }
				))
					return false;
		}

		return true;
	}
	
	// Checks line of sight between the centers of two segments
	// Returns true if los is not blocked by a wall
	losCenter (startSegment_, endSegment_)
	{
		if (! startSegment_ || startSegment_.equals (endSegment_)) 
			return true;
	
		if (! endSegment_)
			return false;
	
		if (! startSegment_.isValid || ! endSegment_.isValid)
			return false;

		const p1 = startSegment_.center;
		const p2 = endSegment_.center;

		return !CONFIG.Canvas.polygonBackends.sight.testCollision(
			{ x: p1.px, y: p1.py },
			{ x: p2.px, y: p2.py },
			{ type: "sight", mode: "any" }
		);
	}

	partialLOS (oldSegment_, newSegment_)
	{
		if (! oldSegment_.isValid || ! newSegment_.isValid)
			return false;

		return CONFIG.Canvas.polygonBackends.sight.testCollision(
			{ x: oldSegment_.center.px, y: oldSegment_.center.py },
			{ x: newSegment_.center.px, y: newSegment_.center.py },
			{ type: "sight", mode: "any" }
		);
	}

	// Moves the stored token to a grid segment_
	// The token is rotated to point toward the destination before moving. There is a delay in ms, rotationWait_,
	// between this rotation and movement
	async moveTokenToSegment (segment_, rotateWait_ = 100)
	{
		if (! this.tokenDoc)
			return false;

		const pf = new PointFactory (segment_.metric);
		const cur = pf.segmentFromToken (this.tokenDoc);

		if (segment_.equals (cur))
			return true;

		// Check if rotation is disabled
		if (!this.tokenDoc.lockRotation) {
			// Calculate the angular distance to the destination grid space
			const dTheta = cur.radialDistToSegment (segment_, this.tokenDoc.rotation, AngleTypes.DEG);

			if (dTheta)
			{
				// Rotate the token to face the direction it moves in
				await this.tokenDoc.update ({ rotation: (this.tokenDoc.rotation + dTheta) % 360 }).then (
				(resolve, reject) => { 
					// Wait between rotating and moving
					return new Promise (resolve => setTimeout (resolve, dTheta / 360 * rotateWait_));
				});
			}
		}

		let ok = true;

		await this.tokenDoc.update ({ x: segment_.point.px, y: segment_.point.py }).catch (err => {
			ui.notifications.warn (err);
			// It really isn't
			ok = false;
		});

		return ok;
	}

	async traverse (distFromEnd_ = 0, rotateWait_ = 100, moveWait_ = 250)
	{
		if (! this.path || ! this.path instanceof Path || ! this.path.valid)
			return false;
		// Redundant?
		if (this.path.length === 0)
			return false;
		if (rotateWait_ < 0 || moveWait_ < 0)
			return false;

		// Make sure the token still exists
		const token = canvas.tokens.get (this.path.token?.document.id);

		if (! token)
			return false;

		// Make sure the token is where we think it is
		const pf = new PointFactory (this.path.path[0].metric);
		const start = pf.fromToken (token);

		if (! start.equals (this.path.path[0].origin))
			return false;

		// Fail if the path doesn't get as close as we want
		if (this.path.terminus.distToDest > distFromEnd_)
			return false;

		const pathToTraverse = this.path.within (distFromEnd_);

		// pathToTraverse[i = 0] is the current point
		for (let i = 1; i < pathToTraverse.length; ++i)
		{
			const success = await this.moveTokenToSegment (pathToTraverse[i], rotateWait_)

			if (! success)
			{
				await token.update ({ x: start.px, y: start.py }).catch (err => {
					console.log (err);
					console.log ("FindThePath | Failed to reset token to start position");
				});
				return false;
			}

			// Wait between moves
			if (i !== pathToTraverse.length - 1)
				await new Promise (resolve => setTimeout (resolve, moveWait_));
		}

		return true;
	}

	get path () { return this._path; }
	set path (path_) { this._path = path_; }
	get token () { return this._token; }
	set token (token_)
	{
		this._token = token_;
		this._tokenDoc = token_.document;
	}
	get tokenDoc () { return this._tokenDoc; }
	set tokenDoc(tokenDoc_) { this._tokenDoc = tokenDoc_; }
};