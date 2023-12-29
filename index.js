const port = 8000;
const domain = "192.168.1.144";
const prefixUrl = `http://${domain}:${port}/`;

const divBlur = document.querySelector("#div-blur");
const wapper = document.querySelector("#wapper");

// bật thông báo khi nhấn nút xóa node
function alertNoti() {
  Swal.fire({
    title: "Bạn chắc chắn muốn xóa chứ?",
    text: "Hành động này không thể hoàn tác!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Đồng ý",
    cancelButtonText: "Hủy bỏ",
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire("Đã xác nhận!", "Hành động đã được thực hiện.", "success");
    }
  });
}

// call API từ server => làm server side từ server rồi thì ko cần
// url: url API
// method: http method
// data: data trong request body
function callAPI(url, method, data = null, handler) {
  if (data instanceof FormData) {
    console.log(data.get("jsonData"));
  }
  apiUrl = `${prefixUrl}${url}`;
  accessToken = localStorage.getItem("accessToken") ? localStorage.getItem("accessToken") : "abcxyz";

  const xhr = new XMLHttpRequest();
  xhr.withCredentials = true;

  xhr.addEventListener("readystatechange", handler);

  xhr.open(method, apiUrl, true);
  xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
  xhr.send(data);
}

const node = document.querySelector("#node");

// call back handler
// e: event khi xảy ra sự kiện click
function nodeItemCloseClick(e) {
  e.stopPropagation();
  alertNoti();

  const confirm = document.querySelector(".swal2-confirm");

  confirm.addEventListener("click", () => {
    const childrenOfNode = [];
    for (item of node.children) {
      childrenOfNode.push(item);
    }
    node.innerHTML = "";
    for (var item of childrenOfNode) {
      if (item != e.target.parentElement.parentElement) {
        node.insertAdjacentElement("beforeend", item);
      }
    }
  });
}

// hàm hiển thị node khi nhấn ok trên form
function showNewNode(roomID, nodeID, mac, status) {
  // Tạo một nodeItem mới
  var newNodeItem = document.createElement("div");
  newNodeItem.className = "nodeItem";
  newNodeItem.onclick = showModal; // Đặt sự kiện onclick để hiển thị modal

  var newNodeTitle = document.createElement("h3");
  newNodeTitle.innerText = `Node ${cnt}`; // Đặt tiêu đề theo mong muốn

  var newInformation = document.createElement("div");
  newInformation.className = "information";

  var informationItems = ["Temperature: 19°C", "Coordinates: X", "Coordinates: Y"];

  const htmlNodeItemClose = `
    <div style="
    position: absolute;
    top: 3px;
    right: 10px;
    color: rgb(94, 92, 92);
    font-weight: 600;
    text-align: center;
    user-select: none;
    " class="nodeItem-close" id=nodeItemClose-${cnt}><p style="margin: 0;">x</p></div>
    <div style="position: absolute; bottom: 15px; right: 15px; color: red; font-weight: 600; text-align: center; user-select: none" class="status">
  `;

  newNodeItem.insertAdjacentHTML("afterbegin", htmlNodeItemClose);
   // Set màu sắc dựa trên giá trị status từ API
    const statusElement = newNodeItem.querySelector(".status");
    statusElement.innerHTML = `<span>${status ? "1" : "0"}</span>`;
    const spanElement = statusElement.querySelector("span");
    statusElement.style.background = status ? "green" : "red";
    spanElement.style.visibility = "hidden"; // Ẩn innertext
  // Thêm các phần tử thông tin
  for (var i = 0; i < informationItems.length; i++) {
    var infoItem = document.createElement("p");
    infoItem.innerText = informationItems[i];
    newInformation.appendChild(infoItem);
  }

  // Gắn các phần tử vào nodeItem mới
  newNodeItem.appendChild(newNodeTitle);
  newNodeItem.appendChild(newInformation);

  const inputHidden = `
    <input type="hidden" name="room-id" id="room-id-${cnt}" value="${roomID}"/>
    <input type="hidden" name="node-id" id="node-id-${cnt}" value="${nodeID}"/>
    <input type="hidden" name="mac" id="mac-${cnt}" value="${mac}"/>
  `;

  newNodeItem.insertAdjacentHTML("beforeend", inputHidden);

  // Gắn nodeItem mới vào phần tử có id 'node'
  document.getElementById("node").appendChild(newNodeItem);
  document.querySelector(`#nodeItemClose-${cnt}`).onclick = nodeItemCloseClick;
  cnt++;
}

document.querySelectorAll(".nodeItem-close").forEach((item) => {
  item.onclick = nodeItemCloseClick;
});

// Gửi thông tin method http post json đến server
document.querySelector(".btn-ok").onclick = () => {
  const roomID = document.querySelector("#room-id").value;
  const nodeID = document.querySelector("#node-id").value;
  const mac = document.querySelector("#mac").value;

  /*const requestJSON = JSON.parse({
    "active": "add_node",
    "room_id": parseInt(roomID),
    "node_id": parseInt(nodeID),
    "MAC": mac
  });

  callAPI('api/wsn/management', 'POST', requestJSON, function () {
    if (this.readyState === 4) {
      let data = JSON.parse(this.responseText);
      if (this.status == 200) {
        divBlur.style.display = 'none';
        wapper.style.display = 'none';
        alert(data['Response']);
        showNewNode(roomID, nodeID, mac);
      }
      else if (this.status == 400) {
        alert(data['Response']);
      }
    }
  });*/

  showNewNode(roomID, nodeID, mac, 1);
  divBlur.style.display = "none";
  wapper.style.display = "none";
};

document.querySelector(".btn-cancel").onclick = () => {
  divBlur.style.display = "none";
  wapper.style.display = "none";
  document.querySelector("#room-id").value = "";
  document.querySelector("#node-id").value = "";
  document.querySelector("#mac").value = "";
};

var cnt = 4;
var temperatureChart; // Biến để lưu đối tượng Chart

// call back handler khi click vào 1 node thì sẽ gọi handler này xử lý
// -> show form
function addNodeItem() {
  // Nhập form add node
  divBlur.style.display = "block";
  wapper.style.display = "block";
}

// show biểu đồ nhiệt khi clcick vào node
function showModal() {
  // Lấy tham chiếu đến modal và canvas
  var modal = document.getElementById("modal");
  var canvas = document.getElementById("temperatureChart");

  // Hiển thị modal
  modal.style.display = "block";

  // Khởi tạo dữ liệu nhiệt độ
  var temperatures = Array.from({ length: 20 }, () => 0);
  var labels = Array.from({ length: 20 }, () => "");

  // Tạo hoặc cập nhật đồ thị
  if (!temperatureChart) {
    // Nếu chưa có đối tượng Chart, tạo mới
    temperatureChart = drawChart(canvas, temperatures, labels);
  } else {
    // Nếu đã có đối tượng Chart, cập nhật dữ liệu
    temperatureChart.update();
  }

  // Cập nhật đồ thị mỗi 5 giây
  setInterval(function () {
    // Mô phỏng cập nhật dữ liệu nhiệt độ
    temperatures.push(Math.floor(Math.random() * 20) + 20);
    labels.push(moment().format("HH:mm:ss"));

    // Giữ số lượng nhãn và dữ liệu tối đa là 20
    if (labels.length > 20) {
      temperatures.shift();
      labels.shift();
    }

    // Cập nhật đối tượng Chart
    temperatureChart.update();
  }, 5000);
}

function drawChart(canvas, data, labels) {
  // Vẽ đồ thị bằng Chart.js
  var ctx = canvas.getContext("2d");
  var chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Nhiệt độ",
          data: data,
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 2,
          fill: false,
        },
      ],
    },
    options: {
      scales: {
        x: {
          type: "category", // Thay đổi loại thành "category"
          position: "bottom",
          title: {
            display: true,
            text: "Thời gian (s)",
            font: {
              size: 16,
              weight: "bold",
            },
          },
          offset: true,
        },
        y: {
          title: {
            display: true,
            text: "Nhiệt độ (°C)",
            font: {
              size: 16,
              weight: "bold",
            },
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              var label = context.dataset.label || "";
              if (label) {
                label += ": ";
              }
              label += context.parsed.y + " °C";
              return label;
            },
          },
        },
      },
    },
  });

  return chart; // Trả về đối tượng Chart để lưu trữ
}

// call back handler sẽ được gọi khi click vào đóng biểu đồ
function closeModal() {
  document.getElementById("modal").style.display = "none";
}

// Đóng modal chỉ khi nhấp vào X
window.onclick = function (event) {
  var modal = document.getElementById("modal");
  var closeButton = document.getElementsByClassName("close")[0];

  if (event.target === closeButton) {
    modal.style.display = "none";
  }
};
