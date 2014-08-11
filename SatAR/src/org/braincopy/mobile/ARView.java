package org.braincopy.mobile;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Matrix;
import android.graphics.Paint;
import android.view.View;

/**
 * 
 * @author Hiroaki Tateshita
 * 
 */
public class ARView extends View {
	private static final float DISTANCE = 1350f;
	Paint paint;
	float lat, lon;
	int width = 0, height = 0;

	/**
	 * [degree]
	 */
	float direction;

	/**
	 * [degree]
	 */
	float pitch;

	/**
	 * [degree]
	 */
	float roll;

	private Satellite[] satellites;

	/**
	 * vertical view angle [degree]
	 */
	final float vVeiwAngle = 30.0f;

	/**
	 * horizontal view angle [degree]
	 */
	final float hVeiwAngle = 25.0f;

	private String statusString = "connecting...";

	private Plane screenPlane;
	private Line line;
	private Point point;

	public ARView(Context context) {
		super(context);
		paint = new Paint();
		paint.setAntiAlias(true);
		paint.setColor(Color.RED);
		paint.setTextSize(20);
		screenPlane = new Plane(0, 0, 0, 0);
	}

	@Override
	protected void onDraw(Canvas canvas) {
		width = canvas.getWidth();
		height = canvas.getHeight();

		canvas.drawText("Direction: " + direction, 50, 50, paint);
		canvas.drawText("Pitch: " + pitch, 50, 100, paint);
		canvas.drawText("Roll: " + roll, 50, 150, paint);
		canvas.drawText("Lat: " + lat, 50, 200, paint);
		canvas.drawText("Lon: " + lon, 50, 250, paint);

		// draw horizon
		drawHorizon(canvas, paint);
		draw30Line(canvas, paint);
		draw60Line(canvas, paint);

		/*
		 * height = (float) (canvas.getHeight() * (0.5 + pitch / (vVeiwAngle *
		 * 0.5) * 0.5)); startX = 0; stopX = canvas.getWidth(); startY = height;
		 * stopY = height; canvas.drawLine(startX, startY, stopX, stopY, paint);
		 */
		drawDirection(canvas, paint);
		drawSatellites(canvas, paint);
		drawStatus(canvas, paint);
		drawTest(canvas, paint, 0, 30);

	}

	private void drawStatus(Canvas canvas, Paint paint2) {
		canvas.drawText(this.statusString + ": " + canvas.getWidth() + ", "
				+ canvas.getHeight(), 50, canvas.getHeight() - 50, paint);
	}

	private void drawTest(Canvas canvas, Paint paint, float az, float el) {
		canvas.drawText("(" + az + "," + el + ")", convertAzElX(az, el),
				convertAzElY(az, el), paint);
	}

	private void drawSatellites(Canvas canvas, Paint paint) {
		float dx = 0;
		float dy = 0;
		Matrix matrix = new Matrix();
		float scale = 1.0f;
		matrix.postScale(scale, scale);
		if (this.satellites != null) {
			for (int i = 0; i < satellites.length; i++) {
				if (direction - satellites[i].getAzimuth() < -270) {
					dx = (float) (canvas.getWidth() * (0.5 - (direction
							- satellites[i].getAzimuth() + 360)
							/ (hVeiwAngle * 0.5) * 0.5));
					dy = (float) (canvas.getHeight() * (0.5 + (pitch - satellites[i]
							.getElevation()) / (vVeiwAngle * 0.5) * 0.5));
				} else if (direction - satellites[i].getAzimuth() > 270) {
					dx = (float) (canvas.getWidth() * (0.5 - (direction
							- satellites[i].getAzimuth() - 360)
							/ (hVeiwAngle * 0.5) * 0.5));
					dy = (float) (canvas.getHeight() * (0.5 + (pitch - satellites[i]
							.getElevation()) / (vVeiwAngle * 0.5) * 0.5));
				} else {
					dx = (float) (canvas.getWidth() * (0.5 - (direction - satellites[i]
							.getAzimuth()) / (hVeiwAngle * 0.5) * 0.5));
					dy = (float) (canvas.getHeight() * (0.5 + (pitch - satellites[i]
							.getElevation()) / (vVeiwAngle * 0.5) * 0.5));
				}
				matrix.postTranslate(dx, dy);
				/*
				 * Log.e("test", "i, dir, az, el: " + i + ", " + direction +
				 * ", " + satellites[i].getAzimuth() + ", " +
				 * satellites[i].getElevation());
				 */
				canvas.drawBitmap(satellites[i].getImage(), matrix, paint);
				canvas.drawText(satellites[i].getDescription(), dx + 30, dy,
						paint);
				matrix.postTranslate(-dx, -dy);
			}
		}
	}

	private void drawHorizon(Canvas canvas, Paint paint) {
		float startX, stopX, startY, stopY;
		for (int i = 0; i < 4; i++) {
			startX = convertAzElX(i * 90, 0);
			startY = convertAzElY(i * 90, 0);
			stopX = convertAzElX((i + 1) * 90, 0);
			stopY = convertAzElY((i + 1) * 90, 0);
			canvas.drawLine(startX, startY, stopX, stopY, paint);
		}
	}

	private void draw30Line(Canvas canvas, Paint paint) {
		float startX, stopX, startY, stopY;
		for (int i = 0; i < 8; i++) {
			startX = convertAzElX(i * 45, 30);
			startY = convertAzElY(i * 45, 30);
			stopX = convertAzElX((i + 1) * 45, 30);
			stopY = convertAzElY((i + 1) * 45, 30);
			canvas.drawLine(startX, startY, stopX, stopY, paint);
		}
	}

	private void draw60Line(Canvas canvas, Paint paint) {
		float startX, stopX, startY, stopY;
		for (int i = 0; i < 8; i++) {
			startX = convertAzElX(i * 45, 60);
			startY = convertAzElY(i * 45, 60);
			stopX = convertAzElX((i + 1) * 45, 60);
			stopY = convertAzElY((i + 1) * 45, 60);
			canvas.drawLine(startX, startY, stopX, stopY, paint);
		}
	}

	private void drawDirection(Canvas canvas, Paint paint) {
		float startX, stopX, startY, stopY;

		// draw west
		startX = convertAzElX(180, 0);
		startY = convertAzElY(180, 0);
		stopX = convertAzElX(180, 90);
		stopY = convertAzElY(180, 90);
		canvas.drawLine(startX, startY, stopX, stopY, paint);
		canvas.drawText("W", startX, startY, paint);

		// draw south
		startX = convertAzElX(90, 0);
		startY = convertAzElY(90, 0);
		stopX = convertAzElX(90, 90);
		stopY = convertAzElY(90, 90);
		canvas.drawLine(startX, startY, stopX, stopY, paint);
		canvas.drawText("S", startX, startY, paint);

		// draw east
		startX = convertAzElX(0, 0);
		startY = convertAzElY(0, 0);
		stopX = convertAzElX(0, 90);
		stopY = convertAzElY(0, 90);
		canvas.drawLine(startX, startY, stopX, stopY, paint);
		canvas.drawText("E", startX, startY, paint);

		// draw north
		startX = convertAzElX(270, 0);
		startY = convertAzElY(270, 0);
		stopX = convertAzElX(270, 90);
		stopY = convertAzElY(270, 90);
		canvas.drawLine(startX, startY, stopX, stopY, paint);
		canvas.drawText("N", startX, startY, paint);

	}

	public void drawScreen(float[] orientation, float lat_, float lon_) {
		direction = ((float) Math.toDegrees(orientation[0]) + 360) % 360;
		pitch = (float) Math.toDegrees(orientation[1]);
		roll = (float) Math.toDegrees(orientation[2]);
		lat = lat_;
		lon = lon_;

		screenPlane.setParam(
				(float) (Math.cos(orientation[1]) * Math.sin(orientation[0])),
				-(float) Math.sin(orientation[1]),
				(float) (Math.cos(orientation[1]) * Math.cos(orientation[0])),
				DISTANCE);

		invalidate();
	}

	/**
	 * 
	 * @param azimuth
	 *            [degree]
	 * @param elevation
	 *            [degree]
	 * @return
	 */
	protected float convertAzElX(float azimuth, float elevation) {
		double dx = 0, dy = 0;
		float result = 0;
		dx = 0.5f * width / Math.tan(hVeiwAngle / 180 * Math.PI)
				* Math.tan(plusMinusPI(azimuth - direction));
		dy = -0.5f * height / Math.tan(vVeiwAngle / 180 * Math.PI)
				* Math.tan(plusMinusPI(elevation - pitch))
				/ Math.cos(plusMinusPI(azimuth - direction));
		/*
		 * rotate by using roll.
		 */
		result = (float) (0.5f * width + dx * Math.cos(roll / 180 * Math.PI) + dy
				* Math.sin(roll / 180 * Math.PI));

		return result;
	}

	/**
	 * 
	 * @param azimuth
	 *            [degree]
	 * @param elevation
	 *            [degree]
	 * @return
	 */
	protected float convertAzElY(float azimuth, float elevation) {
		double dx = 0, dy = 0;
		float result = 0;
		dx = 0.5f * width / Math.tan(hVeiwAngle / 180 * Math.PI)
				* Math.tan(plusMinusPI(azimuth - direction));
		dy = -0.5f * height / Math.tan(vVeiwAngle / 180 * Math.PI)
				* Math.tan(plusMinusPI(elevation - pitch))
				/ Math.cos(plusMinusPI(azimuth - direction));
		/*
		 * rotate by using roll.
		 */
		result = (float) (0.5f * height - dx * Math.sin(roll / 180 * Math.PI) + dy
				* Math.cos(roll / 180 * Math.PI));

		return result;
	}

	/**
	 * 
	 * @param azimuth
	 *            [degree]
	 * @param elevation
	 *            [degree]
	 * @return
	 */
	protected Vector convertAzElVector(float azimuth, float elevation) {
		float ce = (float) Math.cos(elevation / 180 * Math.PI);
		float se = (float) Math.sin(elevation / 180 * Math.PI);
		float ca = (float) Math.cos(azimuth / 180 * Math.PI);
		float sa = (float) Math.sin(azimuth / 180 * Math.PI);
		line = new Line(ce * sa, -se, ce * ca);
		point = this.screenPlane.getIntersection(line);
		point.rotateX(pitch);
		point.rotateY(direction);
		point.rotateZ(roll);
		Vector result = new Vector(0.5f * width + point.x, 0.5f * height
				+ point.y);

		return result;
	}

	/**
	 * 
	 * @param in
	 *            [degree]
	 * @return
	 */
	private float plusMinusPI(float in) {
		if (in < -180) {
			in += 360;
		} else if (in > 180) {
			in -= 360;
		}
		return (float) (in * Math.PI / 180);
	}

	public Satellite[] getSatellites() {
		return satellites;
	}

	public void setSatellites(Satellite[] satellites) {
		this.satellites = satellites;
	}

	public void setStatus(String string) {
		this.statusString = string;

	}

}
