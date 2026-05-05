package com.payplusapp

import android.app.DatePickerDialog
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale

class PayPlusDatePickerModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private val isoFormatter = SimpleDateFormat("yyyy-MM-dd", Locale.US).apply {
    isLenient = false
  }

  override fun getName(): String = "PayPlusDatePicker"

  @ReactMethod
  fun show(initialDate: String?, promise: Promise) {
    val activity = reactContext.currentActivity
    if (activity == null) {
      promise.reject("NO_ACTIVITY", "Could not open date picker.")
      return
    }

    val calendar = Calendar.getInstance()
    if (!initialDate.isNullOrBlank()) {
      try {
        isoFormatter.parse(initialDate)?.let { calendar.time = it }
      } catch (_: Exception) {
        // Fall back to today's date if the incoming value is not parseable.
      }
    }

    activity.runOnUiThread {
      var settled = false
      val dialog = DatePickerDialog(
        activity,
        { _, year, month, dayOfMonth ->
          if (settled) return@DatePickerDialog
          settled = true
          val selected = Calendar.getInstance().apply {
            set(Calendar.YEAR, year)
            set(Calendar.MONTH, month)
            set(Calendar.DAY_OF_MONTH, dayOfMonth)
          }
          promise.resolve(isoFormatter.format(selected.time))
        },
        calendar.get(Calendar.YEAR),
        calendar.get(Calendar.MONTH),
        calendar.get(Calendar.DAY_OF_MONTH)
      )

      dialog.setOnCancelListener {
        if (!settled) {
          settled = true
          promise.resolve(null)
        }
      }
      dialog.setOnDismissListener {
        if (!settled) {
          settled = true
          promise.resolve(null)
        }
      }

      dialog.show()
    }
  }
}
